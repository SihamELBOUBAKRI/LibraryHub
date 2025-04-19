<?php

namespace App\Http\Controllers;

use App\Models\BookToRent;
use Illuminate\Support\Str;
use App\Models\ActiveRental;
use Illuminate\Http\Request;
use App\Models\MembershipCard;
use App\Models\BookReservation;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class BookReservationController extends Controller
{
    // Get all reservations
    public function index()
    {
        // Auto-check statuses when someone views reservations
        $this->checkStatuses();
        
        $reservations = BookReservation::with(['user', 'book', 'membershipCard'])->latest()->get();
        return response()->json($reservations);
    }
    public function show($id)
{
    return BookReservation::with(['user', 'book', 'membershipCard'])
        ->findOrFail($id);
}
    
    protected function checkStatuses()
    {
        // Same logic as the Artisan command above
        BookReservation::where('status', 'waiting')
            ->where('created_at', '<=', now()->subDays(3))
            ->update(['status' => 'expired']);
            
        $toCancel = BookReservation::where('status', 'expired')
            ->where('created_at', '<=', now()->subDays(5))
            ->with('book')
            ->get();
            
        foreach ($toCancel as $reservation) {
            $reservation->book->increment('stock');
            if ($reservation->book->stock > 0) {
                $reservation->book->update(['availability_status' => 'available']);
            }
            $reservation->update(['status' => 'cancelled']);
        }
    }

    // Create new reservation
    // Create new reservation
public function store(Request $request)
{
    $validated = $request->validate([
        'book_id' => 'required|exists:book_to_rent,id',
        'card_number' => 'required|exists:membership_cards,card_number',
        'payment_method' => 'required|in:cash,credit_card',
        'card_holder_name' => 'required_if:payment_method,credit_card|nullable|string|max:255',
        'card_last_four' => 'required_if:payment_method,credit_card|nullable|string|size:4',
        'card_expiration' => 'required_if:payment_method,credit_card|nullable|string|size:5',
        'staff_notes' => 'nullable|string' // Added optional staff_notes
    ]);

    return DB::transaction(function () use ($validated) {
        $membership = MembershipCard::where('card_number', $validated['card_number'])
            ->where('valid_until', '>', now())
            ->firstOrFail();

        $book = BookToRent::findOrFail($validated['book_id']);

        // Check if book is available for reservation
        if ($book->availability_status !== 'available') {
            return response()->json(['error' => 'Book not available for reservation'], 400);
        }

        // Create the reservation with all fields
        $reservation = BookReservation::create([
            'user_id' => $membership->user_id,
            'membership_card_id' => $membership->id,
            'book_id' => $book->id,
            'reservation_code' => 'RES-' . Str::upper(Str::random(6)),
            'payment_method' => $validated['payment_method'],
            'card_holder_name' => $validated['payment_method'] === 'credit_card' ? $validated['card_holder_name'] : null,
            'card_last_four' => $validated['payment_method'] === 'credit_card' ? $validated['card_last_four'] : null,
            'card_expiration' => $validated['payment_method'] === 'credit_card' ? $validated['card_expiration'] : null,
            'status' => 'waiting',
            'staff_notes' => $validated['staff_notes'] ?? null, // Added staff_notes
            'pickup_deadline' => now()->addDays(3)
        ]);

        // Update book status to reserved (regardless of stock count)
        $book->update([
            'availability_status' => 'reserved',
            'stock' => $book->stock - 1  // Also decrement stock if needed
        ]);

        return response()->json(
            BookReservation::with(['book', 'user', 'membershipCard'])->find($reservation->id),
            201
        );
    });
}

    // Update reservation
    // Update reservation - now supports updating any field
public function update(Request $request, $id)
{
    $validated = $request->validate([
        'status' => 'sometimes|in:waiting,picked,expired,cancelled',
        'staff_notes' => 'sometimes|string|nullable',
        'payment_method' => 'sometimes|in:cash,credit_card',
        'card_holder_name' => 'sometimes|nullable|string|max:255',
        'card_last_four' => 'sometimes|nullable|string|size:4',
        'card_expiration' => 'sometimes|nullable|string|size:5',
        'pickup_deadline' => 'sometimes|date'
    ]);

    $reservation = BookReservation::with(['book', 'membershipCard'])->findOrFail($id);

    return DB::transaction(function () use ($reservation, $validated) {
        // Handle status change to 'picked'
        if (isset($validated['status'])) {
            if ($validated['status'] === 'picked') {
                return $this->createActiveRentalFromReservation($reservation);
            }
            
            // Handle status change to 'cancelled' - increment stock
            if ($validated['status'] === 'cancelled' && $reservation->status !== 'cancelled') {
                $book = $reservation->book;
                $book->increment('stock');
                
                if ($book->stock > 0 && $book->availability_status !== 'available') {
                    $book->update(['availability_status' => 'available']);
                }
            }
        }

        // Update credit card info only if payment method is credit_card
        if (isset($validated['payment_method'])) {
            if ($validated['payment_method'] === 'cash') {
                $validated['card_holder_name'] = null;
                $validated['card_last_four'] = null;
                $validated['card_expiration'] = null;
            } elseif ($validated['payment_method'] === 'credit_card') {
                // Ensure required credit card fields are present
                if (!isset($validated['card_holder_name'])) {
                    $validated['card_holder_name'] = $reservation->card_holder_name;
                }
                if (!isset($validated['card_last_four'])) {
                    $validated['card_last_four'] = $reservation->card_last_four;
                }
                if (!isset($validated['card_expiration'])) {
                    $validated['card_expiration'] = $reservation->card_expiration;
                }
            }
        }

        // Update the reservation with validated data
        $reservation->update($validated);

        return response()->json(
            BookReservation::with(['book', 'user', 'membershipCard'])->find($reservation->id)
        );
    });
}
    // Delete reservation
    public function destroy($id)
    {
        $reservation = BookReservation::findOrFail($id);
        
        DB::transaction(function () use ($reservation) {
            $book = $reservation->book;
            
            // Only increment stock if reservation wasn't already cancelled
            if ($reservation->status !== 'cancelled') {
                $book->increment('stock');
                
                // Update availability status if needed
                if ($book->stock > 0 && $book->availability_status !== 'available') {
                    $book->update(['availability_status' => 'available']);
                }
            }

            $reservation->delete();
        });

        return response()->json(null, 204);
    }


    // Mark as picked (creates active rental)
    public function markAsPicked($id)
    {
        $reservation = BookReservation::findOrFail($id);
        return $this->createActiveRentalFromReservation($reservation);
    }

    // Helper method to create active rental from reservation
    protected function createActiveRentalFromReservation(BookReservation $reservation)
    {
        return DB::transaction(function () use ($reservation) {
            if ($reservation->status !== 'waiting') {
                return response()->json(['error' => 'Only waiting reservations can be picked'], 400);
            }

            // Create active rental
            $rental = ActiveRental::create([
                'user_id' => $reservation->user_id,
                'book_id' => $reservation->book_id,
                'reservation_id' => $reservation->id,
                'membership_card_number' => $reservation->membershipCard->card_number,
                'payment_method' => $reservation->payment_method,
                'card_holder_name' => $reservation->card_holder_name,
                'card_last_four' => $reservation->card_last_four,
                'card_expiration' => $reservation->card_expiration,
                'status' => 'active',
                'rental_date' => now(),
                'due_date' => now()->addDays(14) // Default 14-day rental period
            ]);

            // Update reservation
            $reservation->update([
                'status' => 'picked',
                'picked_up_at' => now()
            ]);

            // Update book status
            $reservation->book()->update(['availability_status' => 'rented']);

            return response()->json([
                'message' => 'Reservation marked as picked and rental started',
                'rental' => $rental
            ]);
        });
    }

    // Get reservations by status
    public function byStatus($status)
    {
        $validStatuses = ['waiting', 'picked', 'expired', 'cancelled'];
        
        if (!in_array($status, $validStatuses)) {
            return response()->json(['error' => 'Invalid status'], 400);
        }

        $reservations = BookReservation::where('status', $status)
            ->with(['user', 'book'])
            ->get();

        return response()->json($reservations);
    }
    public function getUserReservations($userId)
    {
        $reservations = BookReservation::where('user_id', $userId)
            ->with(['book', 'membershipCard'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reservations);
    }
    // Add this method to expire reservations after 3 days
public function expireOldReservations()
{
    $threeDaysAgo = now()->subDays(3);
    
    BookReservation::where('status', 'waiting')
        ->where('created_at', '<=', $threeDaysAgo)
        ->update(['status' => 'expired']);
        
    return response()->json(['message' => 'Expired old reservations']);
}

// Add this method to cancel expired reservations after 2 more days (total 5 days)
public function cancelExpiredReservations()
{
    $fiveDaysAgo = now()->subDays(5);
    
    $reservations = BookReservation::where('status', 'expired')
        ->where('created_at', '<=', $fiveDaysAgo)
        ->get();
        
    foreach ($reservations as $reservation) {
        $book = $reservation->book;
        $book->increment('stock');
        
        if ($book->stock > 0) {
            $book->update(['availability_status' => 'available']);
        }
    }
    
    BookReservation::where('status', 'expired')
        ->where('created_at', '<=', $fiveDaysAgo)
        ->update(['status' => 'cancelled']);
        
    return response()->json(['message' => 'Cancelled expired reservations']);
}
}
