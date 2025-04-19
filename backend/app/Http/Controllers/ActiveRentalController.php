<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Rental;
use App\Models\Overdue;
use App\Models\BookToRent;
use App\Models\ActiveRental;
use Illuminate\Http\Request;
use App\Models\MembershipCard;
use App\Models\BookReservation;
use Illuminate\Validation\Rule;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class ActiveRentalController extends Controller
{
    // Get all active rentals
    public function index()
    {
        return ActiveRental::with(['user', 'book', 'reservation', 'membershipCard'])
            ->latest()
            ->get();
    }

    // Create new rental
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'book_id' => 'required_without:reservation_id|exists:book_to_rent,id',
            'reservation_id' => 'required_without:book_id|exists:book_reservations,id',
            'membership_card_number' => [
                'required',
                Rule::exists('membership_cards', 'card_number')->where('user_id', $request->user_id)
            ],
            'payment_method' => 'required_if:reservation_id,null|in:cash,credit_card',
            'card_holder_name' => 'required_if:payment_method,credit_card',
            'card_last_four' => 'required_if:payment_method,credit_card|digits:4',
            'card_expiration' => 'required_if:payment_method,credit_card|date_format:m/y',
            'rental_days' => 'required|integer|min:1|max:30'
        ]);

        DB::beginTransaction();
        try {
            $book = null;

            // Handle walk-in rental
            if ($request->has('book_id')) {
                $book = BookToRent::findOrFail($validated['book_id']);
                if ($book->availability_status !== 'available') {
                    throw new \Exception('Book is not available for rental');
                }
            }

            // Handle reservation-based rental
            if ($request->has('reservation_id')) {
                $reservation = BookReservation::findOrFail($validated['reservation_id']);
                if ($reservation->status !== 'picked') {
                    throw new \Exception('Reservation must be picked first');
                }
                $book = $reservation->book;
            }

            // Create the rental
            $rental = ActiveRental::create([
                'user_id' => $validated['user_id'],
                'book_id' => $book->id ?? null,
                'reservation_id' => $validated['reservation_id'] ?? null,
                'membership_card_number' => $validated['membership_card_number'],
                'payment_method' => $validated['payment_method'] ?? null,
                'card_holder_name' => $validated['card_holder_name'] ?? null,
                'card_last_four' => $validated['card_last_four'] ?? null,
                'card_expiration' => $validated['card_expiration'] ?? null,
                'status' => 'active',
                'rental_date' => now(),
                'due_date' => now()->addDays($validated['rental_days'])
            ]);

            // Update book status
            if ($book) {
                $book->update(['availability_status' => 'rented']);
            }

            DB::commit();
            return response()->json($rental->load(['user', 'book']), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Rental creation failed',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    // Update rental status
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,overdue,returned'
        ]);

        DB::beginTransaction();
        try {
            $rental = ActiveRental::findOrFail($id);
            $previousStatus = $rental->status;
            
            // Update status
            $rental->update(['status' => $validated['status']]);

            // Handle status-specific actions
            switch ($validated['status']) {
                case 'overdue':
                    if ($previousStatus !== 'overdue') {
                        $this->createOverdueRecord($rental);
                    }
                    break;
                    
                case 'returned':
                    $this->handleReturnedRental($rental);
                    break;
            }

            DB::commit();
            return response()->json($rental->fresh()->load(['user', 'book']));

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Status update failed',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    // Handle returned rental
    protected function handleReturnedRental(ActiveRental $rental)
    {
        // Create rental history record
        $this->createRentalRecord($rental);

        // Update book status
        if ($rental->book) {
            $rental->book->update(['availability_status' => 'available']);
        }

        // Update reservation status if exists
        if ($rental->reservation) {
            $rental->reservation->update(['status' => 'completed']);
        }
    }

    // Create rental history record
    protected function createRentalRecord(ActiveRental $rental)
    {
        $daysLate = max(0, Carbon::now()->diffInDays($rental->due_date, false));
        
        Rental::create([
            'active_rental_id' => $rental->id,
            'book_id' => $rental->book_id,
            'user_id' => $rental->user_id,
            'rental_date' => $rental->rental_date,
            'due_date' => $rental->due_date,
            'return_date' => now(),
            'days_late' => $daysLate,
            'original_status' => $rental->status
        ]);
    }

    // Create overdue record
    protected function createOverdueRecord(ActiveRental $rental)
    {
        $daysOverdue = Carbon::now()->diffInDays($rental->due_date);
        
        Overdue::create([
            'active_rental_id' => $rental->id,
            'book_id' => $rental->book_id,
            'user_id' => $rental->user_id,
            'penalty_amount' => $this->calculatePenalty($daysOverdue),
            'days_overdue' => $daysOverdue,
            'original_due_date' => $rental->due_date,
            'penalty_paid' => false
        ]);
    }

    // Calculate penalty
    protected function calculatePenalty(int $daysOverdue): float
    {
        $dailyPenalty = 5.00;
        $maxPenalty = 20.00;
        return min($daysOverdue * $dailyPenalty, $maxPenalty);
    }

    // Other methods...
    public function show(ActiveRental $activeRental)
    {
        return $activeRental->load(['user', 'book', 'reservation', 'membershipCard']);
    }

    public function getUserActiveRentals($userId)
    {
        return ActiveRental::where('user_id', $userId)
            ->with(['book', 'reservation'])
            ->latest()
            ->get();
    }


    /**
 * Update the specified active rental
 */
public function update(Request $request, $id)
{
    $validated = $request->validate([
        'book_id' => 'sometimes|exists:book_to_rent,id',
        'reservation_id' => 'sometimes|nullable|exists:book_reservations,id',
        'membership_card_number' => [
            'sometimes',
            Rule::exists('membership_cards', 'card_number')->where('user_id', $request->user_id)
        ],
        'payment_method' => 'sometimes|in:cash,credit_card',
        'card_holder_name' => 'required_if:payment_method,credit_card',
        'card_last_four' => 'required_if:payment_method,credit_card|digits:4',
        'card_expiration' => 'required_if:payment_method,credit_card|date_format:m/y',
        'rental_days' => 'sometimes|integer|min:1|max:30',
        'status' => 'sometimes|in:active,overdue,returned'
    ]);

    DB::beginTransaction();
    try {
        $rental = ActiveRental::findOrFail($id);
        $originalBookId = $rental->book_id;
        
        // Handle book update if changed
        if (isset($validated['book_id'])) {
            $newBook = BookToRent::findOrFail($validated['book_id']);
            if ($newBook->availability_status !== 'available') {
                throw new \Exception('New book is not available for rental');
            }
            
            // Return original book to available status
            if ($originalBookId) {
                BookToRent::where('id', $originalBookId)
                    ->update(['availability_status' => 'available']);
            }
            
            // Mark new book as rented
            $newBook->update(['availability_status' => 'rented']);
        }

        // Handle rental days update
        if (isset($validated['rental_days'])) {
            $validated['due_date'] = Carbon::parse($rental->rental_date)
                ->addDays($validated['rental_days']);
        }

        // Update the rental
        $rental->update($validated);

        // Handle status changes
        if (isset($validated['status'])) {
            switch ($validated['status']) {
                case 'overdue':
                    if ($rental->status !== 'overdue') {
                        $this->createOverdueRecord($rental);
                    }
                    break;
                    
                case 'returned':
                    $this->handleReturnedRental($rental);
                    break;
            }
        }

        DB::commit();
        return response()->json($rental->fresh()->load(['user', 'book']));

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'error' => 'Rental update failed',
            'message' => $e->getMessage()
        ], 400);
    }
}
}