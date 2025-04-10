<?php

namespace App\Http\Controllers;

use App\Models\Rental;
use App\Models\BookToRent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RentalController extends Controller
{
    /**
     * Get all rental history records
     */
    public function index()
    {
        return Rental::with(['book', 'user', 'activeRental'])
                    ->orderBy('return_date', 'desc')
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
        'days_late' => 'required|integer|min:0'
    ]);

    return DB::transaction(function () use ($validated) {
        // Create the rental history record
        $rental = Rental::create($validated);

        // Update the book status to available
        BookToRent::where('id', $validated['book_id'])
                ->update(['availability_status' => 'available']);

        return response()->json($rental, 201);
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
}