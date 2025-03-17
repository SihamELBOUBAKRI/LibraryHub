<?php
namespace App\Http\Controllers;

use App\Models\Overdue;
use App\Models\ActiveRental;
use Illuminate\Http\Request;
use Carbon\Carbon;

class OverdueController extends Controller
{
    // Get all overdue records
    public function index()
    {
        return Overdue::all();
    }

    // Get a specific overdue record
    public function show($id)
    {
        return Overdue::findOrFail($id);
    }

    // Create a new overdue record
    public function store(Request $request)
    {
        // Create a new overdue record based on the request data
        return Overdue::create($request->all());
    }

    // Update an overdue record
    public function update(Request $request, $id)
    {
        $overdue = Overdue::findOrFail($id);
        $overdue->update($request->all());
        return $overdue;
    }

    // Delete an overdue record
    public function destroy($id)
    {
        Overdue::destroy($id);
        return response()->noContent();
    }

    // Mark active rental as overdue and apply penalty
    public function markAsOverdue($rentalId)
    {
        // Find the active rental by rental ID
        $activeRental = ActiveRental::findOrFail($rentalId);

        // Ensure rental status is 'pending' before making it overdue
        if ($activeRental->status === 'pending') {
            $activeRental->status = 'overdue';
            $activeRental->save();

            // Calculate penalty based on overdue days
            $rentalDueDate = Carbon::parse($activeRental->due_date); // Assuming rental has a due_date field
            $daysOverdue = Carbon::now()->diffInDays($rentalDueDate, false); // Get number of days overdue (negative if not overdue)

            if ($daysOverdue > 0) {
                // Example penalty calculation: $5 per day overdue
                $penaltyAmount = $daysOverdue * 5;
            } else {
                // No penalty if the book is not overdue
                $penaltyAmount = 0;
            }

            // Create an overdue record with penalty information
            $overdueData = [
                'rental_id' => $activeRental->rental_id,
                'penalty_amount' => $penaltyAmount,
                'due_date' => Carbon::now()->toDateString(), // The date when penalty was applied
            ];

            Overdue::create($overdueData);

            return response()->json([
                'message' => 'Book status updated to overdue and penalty applied.',
                'overdue' => $overdueData
            ], 200);
        }

        return response()->json([
            'message' => 'The rental is not in "pending" status and cannot be marked as overdue.'
        ], 400);
    }
}
