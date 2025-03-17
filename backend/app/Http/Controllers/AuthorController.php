<?php
namespace App\Http\Controllers;

use App\Models\Author;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    // Get all authors
    public function index()
    {
        return Author::all();
    }

    // Get a specific author
    public function show($id)
    {
        return Author::findOrFail($id);
    }

    // Create a new author
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'image' => 'nullable|string|max:255',
        ]);

        $author = Author::create($validatedData);

        return response()->json(['message' => 'Author added successfully', 'author' => $author], 201);
    }

    // Update an author
    public function update(Request $request, $id)
    {
        $author = Author::findOrFail($id);
        $author->update($request->all());
        return $author;
    }

    // Delete an author
    public function destroy($id)
    {
        Author::destroy($id);
        return response()->noContent();
    }
}