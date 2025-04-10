<?php
namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\BookToSell;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WishlistController extends Controller
{
    // Get all wishlists (for admin purposes)
    public function index()
    {
        return Wishlist::all();
    }

    // Get a specific wishlist
    public function show($id)
    {
        return Wishlist::findOrFail($id);
    }

    // Create a new wishlist (if needed)
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        return Wishlist::create($request->all());
    }

    // Add a book to a user's wishlist
    public function addToWishlist(Request $request, $userId)
    {
        $request->validate([
            'book_id' => 'required|exists:book_to_sell,id',
        ]);

        // Find or create the user's wishlist
        $wishlist = Wishlist::firstOrCreate(['user_id' => $userId]);

        // Add the book to the wishlist
        $wishlist->books()->attach($request->book_id);

        return response()->json(['message' => 'Book added to wishlist'], 201);
    }

    // Get the wishlist for a specific user (with books included)
    public function getWishlist($userId)
    {
        $wishlist = Wishlist::with('books')->where('user_id', $userId)->first();

        if (!$wishlist) {
            return response()->json(['message' => 'you donot have a wishlist yet'], 200);
        }

        return response()->json($wishlist, 200);
    }

    // Remove a book from a user's wishlist
    public function removeFromWishlist($userId, $bookId)
    {
        $wishlist = Wishlist::where('user_id', $userId)->first();

        if (!$wishlist) {
            return response()->json(['message' => 'Wishlist not found'], 404);
        }

        // Remove the book from the wishlist
        $wishlist->books()->detach($bookId);

        return response()->json(['message' => 'Book removed from wishlist'], 200);
    }

    // Update a wishlist (if needed)
    public function update(Request $request, $id)
    {
        $wishlist = Wishlist::findOrFail($id);
        $wishlist->update($request->all());
        return $wishlist;
    }

    // Delete a wishlist
    public function destroy($id)
    {
        $wishlist = Wishlist::findOrFail($id);
        $wishlist->delete();
        return response()->noContent();
    }
}