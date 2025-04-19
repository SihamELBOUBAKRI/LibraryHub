<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Rental;
use App\Models\BookToRent;
use App\Models\ActiveRental;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class RentalController extends Controller
{
    /**
     * Get all rental history records
     */
    public function index()
    {
        return Rental::with(['book', 'user', 'activeRental'])
                    ->orderBy('return_date', 'desc')
                    ->latest()
                    ->get();
    }

    /**
     * Get a specific rental record
     */
    public function show($id)
    {
        return Rental::with(['book', 'user', 'activeRental'])
                   ->findOrFail($id);
    }

    /**
 * Create a new rental history record (typically called when returning a book)
 */
public function store(Request $request)
{
    $validated = $request->validate([
        'active_rental_id' => 'required|exists:active_rentals,id',
        'book_id' => 'required|exists:book_to_rent,id',
        'user_id' => 'required|exists:users,id',
        'rental_date' => 'required|date',
        'due_date' => 'required|date',
        'return_date' => 'required|date|after_or_equal:rental_date',
        'days_late' => 'sometimes|integer|min:0' // Changed to 'sometimes' as we'll calculate it
    ]);

    return DB::transaction(function () use ($validated) {
        // Get the active rental first
        $activeRental = \App\Models\ActiveRental::findOrFail($validated['active_rental_id']);
        
        // Verify the active rental isn't already returned
        if ($activeRental->status === 'returned') {
            return response()->json([
                'error' => 'Active rental already returned',
                'message' => 'This rental has already been marked as returned'
            ], 400);
        }

        // Calculate days late if not provided
        if (!isset($validated['days_late'])) {
            $returnDate = Carbon::parse($validated['return_date']);
            $dueDate = Carbon::parse($validated['due_date']);
            $validated['days_late'] = max(0, $returnDate->diffInDays($dueDate, false));
        }

        // Create the rental history record
        $rental = Rental::create($validated);
        
        // Update the active rental status
        $activeRental->update(['status' => 'returned']);
        
        // Update the book status to available
        BookToRent::where('id', $validated['book_id'])
                ->update(['availability_status' => 'available']);

        return response()->json($rental->load(['book', 'user', 'activeRental']), 201);
    });
}

    /**
     * Get rental history for a specific user
     */
    public function getUserRentals($userId)
    {
        return Rental::where('user_id', $userId)
                   ->with(['book', 'activeRental'])
                   ->orderBy('return_date', 'desc')
                   ->get();
    }

    /**
     * Get rental history for a specific book
     */
    public function getBookRentals($bookId)
    {
        return Rental::where('book_id', $bookId)
                   ->with(['user', 'activeRental'])
                   ->orderBy('return_date', 'desc')
                   ->get();
    }

    /**
     * Delete a rental record (admin only)
     */
    public function destroy($id)
    {
        $rental = Rental::findOrFail($id);
        $rental->delete();
        
        return response()->noContent();
    }

    /**
     * Generate rental statistics/reports
     */
    public function getStats()
    {
        return DB::transaction(function () {
            $stats = [
                'total_rentals' => Rental::count(),
                'late_returns' => Rental::where('days_late', '>', 0)->count(),
                'avg_days_late' => Rental::avg('days_late'),
                'most_rented_books' => Rental::select('book_id')
                    ->selectRaw('count(*) as rental_count')
                    ->groupBy('book_id')
                    ->orderBy('rental_count', 'desc')
                    ->limit(5)
                    ->with('book')
                    ->get(),
                'recent_returns' => Rental::with(['book', 'user'])
                    ->orderBy('return_date', 'desc')
                    ->limit(10)
                    ->get()
            ];

            return response()->json($stats);
        });
    }
    /**
 * Update the specified rental record
 */
public function update(Request $request, $id)
{
    $validated = $request->validate([
        'active_rental_id' => 'sometimes|exists:active_rentals,id',
        'book_id' => 'sometimes|exists:book_to_rent,id',
        'user_id' => 'sometimes|exists:users,id',
        'rental_date' => 'sometimes|date',
        'due_date' => 'sometimes|date',
        'return_date' => 'sometimes|date|after_or_equal:rental_date',
        'days_late' => 'sometimes|integer|min:0'
    ]);

    return DB::transaction(function () use ($validated, $id) {
        $rental = Rental::findOrFail($id);

        // Only calculate days_late automatically if return_date is being updated 
        // AND days_late wasn't explicitly provided
        if (isset($validated['return_date']) && !isset($validated['days_late'])) {
            $returnDate = Carbon::parse($validated['return_date']);
            $dueDate = isset($validated['due_date']) 
                ? Carbon::parse($validated['due_date'])
                : Carbon::parse($rental->due_date);
            $validated['days_late'] = max(0, $returnDate->diffInDays($dueDate, false));
        }

        // Update only the fields that were provided
        $rental->fill($validated);
        
        // If changing the active rental, verify the new one exists
        if (isset($validated['active_rental_id'])) {
            $newActiveRental = ActiveRental::findOrFail($validated['active_rental_id']);
            if ($newActiveRental->status === 'returned') {
                return response()->json([
                    'error' => 'Cannot assign returned rental',
                    'message' => 'The selected active rental has already been returned'
                ], 400);
            }
        }

        $rental->save();

        return response()->json($rental->load(['book', 'user', 'activeRental']));
    });
}
}