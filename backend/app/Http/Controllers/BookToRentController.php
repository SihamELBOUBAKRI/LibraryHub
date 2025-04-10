<?php
namespace App\Http\Controllers;

use App\Models\BookToRent;
use Illuminate\Http\Request;

class BookToRentController extends Controller
{
    // Get all books available for rent
    public function index()
    {
        try {
            $books = BookToRent::with('category','author')->get();
            return response()->json($books);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Get a specific book available for rent
    public function show($id)
    {
        return BookToRent::findOrFail($id);
    }

    // Create a new book available for rent
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'author_id' => 'required|exists:authors,id',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'published_year' => 'nullable|integer|min:1000|max:' . date('Y'),
            'rental_price' => 'required|numeric|min:0',
            'image' => 'nullable|string|max:255',
            'rental_period_days' => 'required|integer|min:1',
            'late_fee_per_day' => 'required|numeric|min:0',
            'damage_fee' => 'nullable|numeric|min:0',
            'total_rentals' => 'integer|min:0',
            'availability_status' => 'required|in:available,rented,reserved',
            'condition' => 'required|in:new,good,fair,damaged',
            'min_rental_period_days' => 'required|integer|min:1',
        ]);

        $book = BookToRent::create($validatedData);

        return response()->json(['message' => 'Book added for rent successfully', 'book' => $book], 201);
    }

    // Update a book available for rent
    public function update(Request $request, $id)
    {
        $book = BookToRent::findOrFail($id);
        
        $validatedData = $request->validate([
            'title' => 'sometimes|string|max:255',
            'author_id' => 'sometimes|exists:authors,id',
            'category_id' => 'sometimes|exists:categories,id',
            'description' => 'sometimes|nullable|string',
            'published_year' => 'sometimes|nullable|integer|min:1000|max:' . date('Y'),
            'rental_price' => 'sometimes|numeric|min:0',
            'image' => 'sometimes|nullable|string|max:255',
            'rental_period_days' => 'sometimes|integer|min:1',
            'late_fee_per_day' => 'sometimes|numeric|min:0',
            'damage_fee' => 'sometimes|nullable|numeric|min:0',
            'total_rentals' => 'sometimes|integer|min:0',
            'availability_status' => 'sometimes|in:available,rented,reserved',
            'condition' => 'sometimes|in:new,good,fair,damaged',
            'min_rental_period_days' => 'sometimes|integer|min:1',
        ]);

        $book->update($validatedData);
        
        return response()->json(['message' => 'Book updated successfully', 'book' => $book], 200);
    }

    // Delete a book available for rent
    public function destroy($id)
    {
        BookToRent::destroy($id);
        return response()->json(['message' => 'Book deleted successfully'], 204);
    }
}
