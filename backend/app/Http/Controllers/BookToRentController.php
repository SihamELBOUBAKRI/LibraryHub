<?php
namespace App\Http\Controllers;

use App\Models\BookToRent;
use Illuminate\Http\Request;

class BookToRentController extends Controller
{
    // Get all books available for rent
    public function index()
    {
        return BookToRent::all();
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
        'stock' => 'required|integer|min:0',
        'image' => 'nullable|string|max:255',
    ]);

    $book = BookToRent::create($validatedData);

    return response()->json(['message' => 'Book added for rent successfully', 'book' => $book], 201);
}
    // Update a book available for rent
    public function update(Request $request, $id)
    {
        $book = BookToRent::findOrFail($id);
        $book->update($request->all());
        return $book;
    }

    // Delete a book available for rent
    public function destroy($id)
    {
        BookToRent::destroy($id);
        return response()->noContent();
    }
}