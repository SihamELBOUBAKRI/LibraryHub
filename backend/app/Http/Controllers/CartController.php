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
    $validator = Validator::make($request->all(), [
        'book_id' => 'required|exists:book_to_sell,id',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 400);
    }

    // Find or create the user's cart
    $cart = Cart::firstOrCreate(['user_id' => $userId]);

    // Find the existing cart item
    $cartItem = CartItem::where('cart_id', $cart->id)
        ->where('book_id', $request->book_id)
        ->first();

    if ($cartItem) {
        // Increment the quantity by 1
        $cartItem->quantity += 1;
    } else {
        // Add a new cart item with quantity 1
        $cartItem = new CartItem([
            'cart_id' => $cart->id,
            'book_id' => $request->book_id,
            'quantity' => 1,
        ]);
    }

    // Update total amount
    $cartItem->total_amount = $cartItem->quantity * BookToSell::find($request->book_id)->price;
    $cartItem->save();

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

    // Find the specific cart item (book)
    $cartItem = $cart->items()->where('book_id', $bookId)->first();

    if ($cartItem) {
        if ($cartItem->quantity > 1) {
            // Decrease the quantity by 1
            $cartItem->quantity -= 1;
            $cartItem->total_amount = $cartItem->quantity * $cartItem->book->price;
            $cartItem->save();
        } else {
            // If quantity is 1, remove the book from the cart
            $cartItem->delete();
        }
    }

    // Recalculate the total amount of the cart
    $totalAmount = $this->calculateTotal($cart);

    // Return the updated cart and total amount
    return response()->json([
        'message' => 'Item updated in cart',
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