<?php
namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Cart;
use App\Models\BookToSell;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // Get all orders
    public function index()
    {
        return Order::with('books')->get(); // Eager loading books with the orders
    }

    // Get a specific order
    public function show($id)
    {
        return Order::with('books')->findOrFail($id); // Eager loading books with the specific order
    }

    // Create a new order
    public function store(Request $request)
    {
        // Assuming the user is authenticated, we can get the user ID from the auth system
        $userId = auth()->id();

        // Find the cart for the user
        $cart = Cart::where('user_id', $userId)->first();

        if (!$cart) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        // Start a database transaction to ensure consistency
        DB::beginTransaction();

        try {
            // Create the order, assuming it contains necessary info like total_price
            $order = Order::create([
                'user_id' => $userId,
                'total_price' => $request->total_price, // The total price passed in the request
                'status' => 'Pending',
                'payment_method' => $request->payment_method,
                'shipping_address' => $request->shipping_address
            ]);

            // Attach books to the order
            foreach ($cart->books as $book) {
                $order->books()->attach($book->id, ['quantity' => $book->pivot->quantity]);
            }

            // Optionally, clear the cart after the order is created
            $cart->books()->detach();

            // Commit the transaction
            DB::commit();

            return response()->json($order, 201);

        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollBack();
            return response()->json(['message' => 'Error creating order', 'error' => $e->getMessage()], 500);
        }
    }

    // Update an order
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        // Optionally, update the order status or any other fields
        $order->update($request->all());

        return response()->json($order);
    }

    // Delete an order
    public function destroy($id)
    {
        $order = Order::findOrFail($id);

        // Optionally, you could clean up any related data like updating stock or notifying users
        $order->delete();

        return response()->noContent();
    }
}
