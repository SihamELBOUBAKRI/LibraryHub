<?php
namespace App\Http\Controllers;

use App\Models\BookToSell;
use Illuminate\Http\Request;

class BookToSellController extends Controller
{
    // Get all books available for sale
    public function index()
{
    try {
        $books = BookToSell::with('category','author')->get();
        return response()->json($books);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

    // Get a specific book available for sale
    public function show($id)
    {
        return BookToSell::findOrFail($id);
    }

    // Create a new book available for sale
    public function store(Request $request)
{
    $validatedData = $request->validate([
        'title' => 'required|string|max:255',
        'author_id' => 'required|exists:authors,id',
        'category_id' => 'required|exists:categories,id',
        'description' => 'nullable|string',
        'published_year' => 'nullable|integer|min:1000|max:' . date('Y'),
        'price' => 'required|numeric|min:0',
        'stock' => 'required|integer|min:0',
        'image' => 'nullable|string|max:255',
    ]);

    $book = BookToSell::create($validatedData);

    return response()->json(['message' => 'Book added for sale successfully', 'book' => $book], 201);
}

    // Update a book available for sale
    public function update(Request $request, $id)
    {
        $book = BookToSell::findOrFail($id);
        $book->update($request->all());
        return $book;
    }

    // Delete a book available for sale
    public function destroy($id)
    {
        BookToSell::destroy($id);
        return response()->noContent();
    }
}