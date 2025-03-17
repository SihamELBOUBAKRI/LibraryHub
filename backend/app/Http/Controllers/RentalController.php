<?php

namespace App\Http\Controllers;

use App\Models\Rental;
use Illuminate\Http\Request;

class RentalController extends Controller
{
    // Get all returned rentals
    public function index()
    {
        return Rental::all(); // Returns only books that have been returned
    }

    // Get a specific rental record
    public function show($id)
    {
        return Rental::findOrFail($id);
    }

    // (No need for store method since rentals are moved from active_rentals)
    
    // Update rental details
    public function update(Request $request, $id)
    {
        $rental = Rental::findOrFail($id);
        $rental->update($request->all());
        return response()->json(['message' => 'Rental updated successfully.', 'rental' => $rental], 200);
    }

    // Delete a rental record (admin only)
    public function destroy($id)
    {
        Rental::destroy($id);
        return response()->json(['message' => 'Rental deleted successfully.'], 200);
    }
}
