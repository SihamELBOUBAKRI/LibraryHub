<?php

namespace App\Http\Controllers;

use App\Models\Overdue;
use App\Models\Rental;
use App\Models\BookToRent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OverdueController extends Controller
{
    // Get all overdue records with relationships
    public function index()
    {
        return Overdue::with(['activeRental', 'book', 'user'])->get();
    }

    // Get a specific overdue record with relationships
    public function show($id)
    {
        return Overdue::with(['activeRental', 'book', 'user'])->findOrFail($id);
    }

    // Update an overdue record (primarily for marking as returned/paid)
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'book_returned' => 'sometimes|boolean',
            'penalty_paid' => 'sometimes|boolean',
            'paid_date' => 'nullable|date|required_if:penalty_paid,true'
        ]);

        return DB::transaction(function () use ($id, $validated) {
            $overdue = Overdue::findOrFail($id);
            
            // Handle book return if specified
            if (isset($validated['book_returned']) && $validated['book_returned'] && !$overdue->book_returned) {
                $this->handleBookReturn($overdue);
            }

            $overdue->update($validated);
            return response()->json($overdue);
        });
    }

    // Get all overdue records for a specific user
    public function getUserOverdues($userId)
    {
        return Overdue::where('user_id', $userId)
            ->with(['book', 'activeRental'])
            ->get();
    }

    /**
     * Handle book return process
     */
    protected function handleBookReturn(Overdue $overdue)
    {
        // Create rental history record
        Rental::create([
            'active_rental_id' => $overdue->active_rental_id,
            'book_id' => $overdue->book_id,
            'user_id' => $overdue->user_id,
            'rental_date' => $overdue->original_due_date->subDays(14), // Assuming 14-day rental period
            'due_date' => $overdue->original_due_date,
            'return_date' => Carbon::now(),
            'days_late' => $overdue->days_overdue
        ]);

        // Update book availability
        BookToRent::where('id', $overdue->book_id)
            ->update(['availability_status' => 'available']);

        // Delete the overdue record
        $overdue->delete();
    }

    // Delete an overdue record
    public function destroy($id)
    {
        $overdue = Overdue::findOrFail($id);
        $overdue->delete();
        return response()->noContent();
    }
}