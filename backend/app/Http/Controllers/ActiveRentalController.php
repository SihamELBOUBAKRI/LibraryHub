<?php
namespace App\Http\Controllers;

use App\Models\ActiveRental;
use Illuminate\Http\Request;

class ActiveRentalController extends Controller
{
    // Get all active rentals
    public function index()
{
    $activeRentals = ActiveRental::all();
    \Log::info('Active Rentals: ', $activeRentals->toArray()); // Log the active rentals to the log file
    return response()->json($activeRentals, 200);
}
    // Get a specific active rental
    public function show($id)
    {
        return ActiveRental::findOrFail($id);
    }

    // Create a new active rental
    public function store(Request $request)
    {
        return ActiveRental::create($request->all());
    }

    // Update an active rental
    public function update(Request $request, $id)
    {
        $activeRental = ActiveRental::findOrFail($id);
        $activeRental->update($request->all());
    
        if ($request->status === 'returned') {
            // Move to rentals table
            \App\Models\Rental::create([
                'user_id' => $activeRental->user_id,
                'book_id' => $activeRental->book_id,
                'rental_date' => $activeRental->created_at, // Use original rent date
                'return_date' => now() // Set return date as now
            ]);
    
            // Delete from active_rentals
            $activeRental->delete();
        } elseif ($request->status === 'overdue') {
            // Move to overdues table
            \App\Models\Overdue::create([
                'rental_id' => $activeRental->id,
                'penalty_amount' => 5.00, // Change dynamically if needed
                'due_date' => now()
            ]);
    
            // Delete from active_rentals
            $activeRental->delete();
        }
    
        return response()->json(['message' => 'Active rental updated successfully.'], 200);
    }
    
}