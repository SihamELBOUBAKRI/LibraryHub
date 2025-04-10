<?php

namespace App\Http\Controllers;

use App\Models\ActiveRental;
use App\Models\BookReservation;
use App\Models\BookToRent;
use App\Models\MembershipCard;
use App\Models\Overdue;
use App\Models\Rental;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class ActiveRentalController extends Controller
{
    // Get all active rentals
    public function index()
    {
        return ActiveRental::with(['user', 'book', 'reservation', 'membershipCard'])
            ->latest()
            ->get();
    }

    // Create new rental (for both reservation and walk-in)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'book_id' => 'nullable|exists:book_to_rent,id',
            'reservation_id' => 'nullable|exists:book_reservations,id',
            'membership_card_number' => [
                'required',
                Rule::exists('membership_cards', 'card_number')->where(function ($query) use ($request) {
                    $query->where('user_id', $request->user_id);
                })
            ],
            'payment_method' => 'nullable|required_if:reservation_id,null|in:cash,credit_card',
            'card_holder_name' => 'nullable|required_if:payment_method,credit_card',
            'card_last_four' => 'nullable|required_if:payment_method,credit_card|digits:4',
            'card_expiration' => 'nullable|required_if:payment_method,credit_card|date_format:m/y',
            'rental_days' => 'required|integer|min:1|max:30'
        ]);
    
        return DB::transaction(function () use ($validated) {
            // For walk-in rentals, verify book availability
            if ($validated['book_id']) {
                $book = BookToRent::findOrFail($validated['book_id']);
                if (!$book->isAvailable()) {
                    return response()->json(['error' => 'Book is not available for rental'], 400);
                }
            }
    
            // For reservations, verify it exists and is picked
            if ($validated['reservation_id']) {
                $reservation = BookReservation::findOrFail($validated['reservation_id']);
                if ($reservation->status !== 'picked') {
                    return response()->json(['error' => 'Reservation must be picked first'], 400);
                }
                $book = $reservation->book;
            }
    
            // Create the rental
            $rental = ActiveRental::create([
                'user_id' => $validated['user_id'],
                'book_id' => $validated['book_id'] ?? $reservation->book_id ?? null,
                'reservation_id' => $validated['reservation_id'] ?? null,
                'membership_card_number' => $validated['membership_card_number'],
                'payment_method' => $validated['payment_method'] ?? null,
                'card_holder_name' => $validated['card_holder_name'] ?? null,
                'card_last_four' => $validated['card_last_four'] ?? null,
                'card_expiration' => $validated['card_expiration'] ?? null,
                'status' => 'pending',
                'rental_date' => now(),
                'due_date' => now()->addDays($validated['rental_days'])
            ]);
    
            // Update book status to rented (for both walk-ins and reservations)
            if (isset($book)) {
                $book->update(['availability_status' => 'rented']);
            }
    
            return response()->json($rental->load(['user', 'book', 'reservation']), 201);
        });
    }

    // Get specific rental
    public function show(ActiveRental $activeRental)
    {
        return $activeRental->load(['user', 'book', 'reservation', 'membershipCard']);
    }

    // Update rental status
    public function update(Request $request, ActiveRental $activeRental)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,overdue,returned'
        ]);

        return DB::transaction(function () use ($validated, $activeRental) {
            $previousStatus = $activeRental->status;
            $activeRental->update(['status' => $validated['status']]);

            // Handle overdue status
            if ($validated['status'] === 'overdue' && $previousStatus !== 'overdue') {
                $this->createOverdueRecord($activeRental);
            }

            // Handle returned status
            if ($validated['status'] === 'returned') {
                // Mark book as available
                if ($activeRental->book_id) {
                    BookToRent::where('id', $activeRental->book_id)
                        ->update(['availability_status' => 'available']);
                }

                // Create rental history record
                $this->createRentalRecord($activeRental);

                // Update reservation status if exists
                if ($activeRental->reservation_id) {
                    $activeRental->reservation->update(['status' => 'completed']);
                }
            }

            return response()->json($activeRental->fresh());
        });
    }

    // Get user's active rentals
    public function getUserActiveRentals($userId)
    {
        return ActiveRental::where('user_id', $userId)
            ->with(['book', 'reservation'])->latest()
            ->get();
    }

    // Mark rental as overdue (can be automated via cron)
    public function markOverdue(ActiveRental $activeRental)
    {
        if ($activeRental->due_date->isPast() && $activeRental->status === 'pending') {
            return DB::transaction(function () use ($activeRental) {
                $activeRental->update(['status' => 'overdue']);
                $this->createOverdueRecord($activeRental);
                return response()->json(['message' => 'Rental marked as overdue']);
            });
        }

        return response()->json(['message' => 'Rental is not overdue'], 400);
    }

    /**
     * Create overdue record for an active rental
     */
    protected function createOverdueRecord(ActiveRental $activeRental)
    {
        $daysOverdue = Carbon::now()->diffInDays($activeRental->due_date);
        $penaltyAmount = $this->calculatePenalty($daysOverdue);

        return Overdue::create([
            'active_rental_id' => $activeRental->id,
            'book_id' => $activeRental->book_id,
            'user_id' => $activeRental->user_id,
            'penalty_amount' => $penaltyAmount,
            'days_overdue' => $daysOverdue,
            'original_due_date' => $activeRental->due_date,
            'penalty_paid' => false
        ]);
    }

    /**
     * Create rental history record when book is returned
     */
    protected function createRentalRecord(ActiveRental $activeRental)
    {
        $daysLate = max(0, Carbon::now()->diffInDays($activeRental->due_date, false));
    
        return DB::transaction(function () use ($activeRental, $daysLate) {
            $rental = Rental::create([
                'active_rental_id' => $activeRental->id,
                'book_id' => $activeRental->book_id,
                'user_id' => $activeRental->user_id,
                'rental_date' => $activeRental->rental_date,
                'due_date' => $activeRental->due_date,
                'return_date' => Carbon::now(),
                'days_late' => $daysLate
            ]);
    
            // Update book status to available
            if ($activeRental->book_id) {
                BookToRent::where('id', $activeRental->book_id)
                        ->update(['availability_status' => 'available']);
            }
    
            return $rental;
        });
    }

    /**
     * Calculate penalty amount based on days overdue
     */
    protected function calculatePenalty(int $daysOverdue): float
    {
        // Customize this calculation based on your business rules
        $dailyPenalty = 5.00; // $5 per day
        $maxPenalty = 20.00; // Maximum $20 penalty
        
        return min($daysOverdue * $dailyPenalty, $maxPenalty);
    }
}