<?php
namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\BookToSell;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    // Get all carts (for admin purposes, if needed)
    public function index()
    {
        return Cart::all();
    }

    // Get a specific cart
    public function show($id)
    {
        return Cart::findOrFail($id);
    }

    // Create a new cart (if a cart doesn't exist for a user, for example)
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        return Cart::create($request->all());
    }

    // Add a book to a user's cart
    public function addToCart(Request $request, $userId)
{
    // Validate incoming data
    $validator = Validator::make($request->all(), [
        'book_id' => 'required|exists:book_to_sell,id',  // Ensure the book exists in the `book_to_sell` table
        'quantity' => 'required|integer|min:1',  // Ensure quantity is a positive integer
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 400);
    }

    // Find or create the user's cart (make sure they only have one)
    $cart = Cart::firstOrCreate(['user_id' => $userId]);

    // Check if the book already exists in the cart, update it or create a new entry in `cart_items`
    $cartItem = CartItem::updateOrCreate(
        ['cart_id' => $cart->id, 'book_id' => $request->book_id],  // Find the existing item or create a new one
        [
            'quantity' => $request->quantity,  // Update quantity
            'total_amount' => $request->quantity * BookToSell::find($request->book_id)->price,  // Calculate total amount
        ]
    );

    // Return response with the added or updated item
    return response()->json($cartItem, 201);
}


    // Get the cart for a specific user (with books included)
    public function getCart($userId)
    {
        $cart = Cart::with('items.book')->where('user_id', $userId)->first();

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        return response()->json($cart, 200);
    }

    // Remove a book from a user's cart
    public function removeFromCart($userId, $bookId)
{
    // Find the user's cart
    $cart = Cart::with('items.book')->where('user_id', $userId)->first();

    // Check if the cart exists
    if (!$cart) {
        return response()->json(['message' => 'Cart not found'], 404);
    }

    // Find the specific cart item (book) and delete it
    $cartItem = $cart->items()->where('book_id', $bookId)->first();
    if ($cartItem) {
        $cartItem->delete();  // Delete the item from the cart
    }

    // Recalculate the total amount of the cart
    $totalAmount = $this->calculateTotal($cart);

    // Return the updated cart and total amount
    return response()->json([
        'message' => 'Item removed from cart',
        'items' => $cart->items,   // Updated list of cart items
        'totalAmount' => $totalAmount  // Updated total amount
    ], 200);
}

    // Update a cart's contents (quantity or other fields)
    public function update(Request $request, $id)
    {
        $cart = Cart::findOrFail($id);

        $request->validate([
            'quantity' => 'integer|min:1',
        ]);

        $cart->update($request->all());

        return response()->json($cart, 200);
    }

    // Delete a cart
    public function destroy($id)
    {
        $cart = Cart::findOrFail($id);
        $cart->delete();

        return response()->noContent();
    }

    // Checkout the cart (place an order and clear the cart)
    public function checkout(Request $request, $cartId)
    {
        $cart = Cart::with('items.book')->findOrFail($cartId);

        // Create an order from the cart
        $order = Order::create([
            'user_id' => $cart->user_id,
            'total_amount' => $this->calculateTotal($cart),
            'status' => 'pending',
        ]);

        // Attach books to the order
        foreach ($cart->items as $item) {
            $order->books()->attach($item->book_id, [
                'quantity' => $item->quantity,
                'price' => $item->book->price,
            ]);
        }

        // Clear the cart after the order is placed
        $cart->items()->delete();

        return response()->json(['message' => 'Checkout successful', 'order' => $order], 201);
    }

    // Helper function to calculate total from the cart
    private function calculateTotal($cart)
    {
        $total = 0;
        foreach ($cart->items as $item) {
            $total += $item->book->price * $item->quantity;
        }
        return $total;
    }
}