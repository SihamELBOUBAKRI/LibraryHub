<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\CartItem;
use App\Models\BookToSell;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cart_id' => 'nullable|exists:carts,id',
            'book_id' => 'nullable|exists:book_to_sell,id',
            'quantity' => 'required_if:book_id,!=,null|integer|min:1',
            'shipping_address' => 'required|string|max:255',
            'payment_method' => 'required|string|in:Credit Card,PayPal,Bank Transfer,Cash on Delivery',
            'card_holder_name' => 'required_if:payment_method,Credit Card|string|max:255',
            'card_last_four' => 'required_if:payment_method,Credit Card|string|size:4',
            'expiration_date' => 'required_if:payment_method,Credit Card|string|max:7',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $orders = [];
        
        DB::beginTransaction();

        try {
            // Generate random transaction ID and tracking number
            $transactionId = 'TXN-' . strtoupper(uniqid());
            $trackingNumber = 'TRK-' . strtoupper(substr(md5(uniqid()), 0, 10));
            $expectedDeliveryDate = now()->addWeek()->toDateString();

            // Case 1: Order a single book
            if ($request->filled('book_id')) {
                $book = BookToSell::lockForUpdate()->findOrFail($request->book_id);
                
                // Check stock availability
                if ($book->stock < $request->quantity) {
                    throw new \Exception("Not enough stock available for book: {$book->title}. Available: {$book->stock}, Requested: {$request->quantity}");
                }

                $order = Order::create([
                    'user_id' => $user->id,
                    'book_id' => $book->id,
                    'quantity' => $request->quantity,
                    'book_price' => $book->price,
                    'total_price' => $book->price * $request->quantity,
                    'shipping_address' => $request->shipping_address,
                    'payment_method' => $request->payment_method,
                    'card_holder_name' => $request->card_holder_name ?? null,
                    'card_last_four' => $request->card_last_four ?? null,
                    'expiration_date' => $request->expiration_date ?? null,
                    'status' => 'Pending',
                    'payment_status' => 'Pending',
                    'notes' => $request->notes ?? null,
                    'transaction_id' => $transactionId,
                    'shipping_tracking_number' => $trackingNumber,
                    'expected_delivery_date' => $expectedDeliveryDate
                ]);
                $order->books()->attach($book->id, [
                    'quantity' => $request->quantity,
                    'book_price' => $book->price
                ]);
                    

                // Decrement stock
                $book->decrement('stock', $request->quantity);

                // Create transaction record
                $this->createTransaction($user->id, $order->total_price, $request->payment_method, $transactionId, $order->id);

                $orders[] = $order;
            }
            // Case 2: Convert cart items to individual book orders
            elseif ($request->filled('cart_id')) {
                $cart = Cart::with(['items.book' => function($query) {
                    $query->lockForUpdate();
                }])->findOrFail($request->cart_id);

                // First check all items have sufficient stock
                foreach ($cart->items as $item) {
                    if ($item->book->stock < $item->quantity) {
                        throw new \Exception("Not enough stock available for book: {$item->book->title}. Available: {$item->book->stock}, Requested: {$item->quantity}");
                    }
                }

                // Process each item
                foreach ($cart->items as $item) {
                    $order = Order::create([
                        'user_id' => $user->id,
                        'book_id' => $item->book_id,
                        'quantity' => $item->quantity,
                        'book_price' => $item->book->price,
                        'total_price' => $item->quantity * $item->book->price,
                        'shipping_address' => $request->shipping_address,
                        'payment_method' => $request->payment_method,
                        'card_holder_name' => $request->card_holder_name ?? null,
                        'card_last_four' => $request->card_last_four ?? null,
                        'expiration_date' => $request->expiration_date ?? null,
                        'status' => 'Pending',
                        'payment_status' => 'Pending',
                        'notes' => $request->notes ?? null,
                        'transaction_id' => $transactionId,
                        'shipping_tracking_number' => $trackingNumber,
                        'expected_delivery_date' => $expectedDeliveryDate
                    ]);
                    $order->books()->attach($item->book_id, [
                        'quantity' => $item->quantity,
                        'book_price' => $item->book->price
                    ]);
                    // Decrement stock
                    $item->book->decrement('stock', $item->quantity);

                    // Create transaction record
                    $this->createTransaction($user->id, $order->total_price, $request->payment_method, $transactionId, $order->id);

                    $orders[] = $order;
                }

                // Clear the cart after converting to orders
                $cart->items()->delete();
                $cart->delete();
            } else {
                return response()->json(['message' => 'Either book_id or cart_id must be provided'], 400);
            }

            DB::commit();

            return response()->json([
                'message' => count($orders) > 1 ? 'Orders placed successfully!' : 'Order placed successfully!',
                'data' => $orders
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to process order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper method to create transaction record
     */
    private function createTransaction($userId, $amount, $paymentMethod, $transactionId, $orderId)
    {
        return Transaction::create([
            'user_id' => $userId,
            'amount' => $amount,
            'payment_method' => $paymentMethod,
            'transaction_id' => $transactionId,
            'transaction_type' => 'Order',
            'payment_status' => 'Completed',
            'order_id' => $orderId,
            'membership_card_id' => null
        ]);
    }

    public function index()
{
    $orders = Order::with(['user', 'books'])->latest()->get();
    return response()->json($orders);
}
    
    public function getUserOrders()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
    
        $orders = Order::with(['books' => function($query) {
            $query->select('book_to_sell.*', 'order_book.quantity as pivot_quantity', 'order_book.book_price as pivot_book_price');
        }])->where('user_id', $user->id)->get();
    
        return response()->json($orders);
    }
    
    public function show($id)
    {
        $order = Order::with(['user', 'books' => function($query) {
            $query->select('book_to_sell.*', 'order_book.quantity as pivot_quantity', 'order_book.book_price as pivot_book_price');
        }])->find($id);
        
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
    
        return response()->json(['data' => $order]);
    }

    public function update(Request $request, $id)
{
    $order = Order::find($id);

    if (!$order) {
        return response()->json(['message' => 'Order not found'], 404);
    }

    $validator = Validator::make($request->all(), [
        'status' => 'sometimes|string|in:Pending,Paid,Shipped,Cancelled',
        'payment_status' => 'sometimes|string|in:Pending,Completed,Failed,Refunded',
        'transaction_id' => 'sometimes|nullable|string|max:255',
        'shipping_tracking_number' => 'sometimes|nullable|string|max:255',
        'expected_delivery_date' => 'sometimes|nullable|date',
        'book_id' => 'sometimes|exists:book_to_sell,id',
        'quantity' => 'sometimes|integer|min:1',
        'shipping_address' => 'sometimes|string|max:255',
        'payment_method' => 'sometimes|string|in:Credit Card,PayPal,Bank Transfer,Cash on Delivery',
        'notes' => 'sometimes|nullable|string|max:500',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    DB::beginTransaction();
    try {
        // Get the validated data
        $validatedData = $validator->validated();
        
        // Handle book_id change - update book price and total price if book changes
        if (isset($validatedData['book_id'])) {
            $book = BookToSell::find($validatedData['book_id']);
            $validatedData['book_price'] = $book->price;
            $validatedData['total_price'] = $book->price * ($validatedData['quantity'] ?? $order->quantity);
        }
        
        // Handle quantity change - update total price if quantity changes
        if (isset($validatedData['quantity']) && !isset($validatedData['book_id'])) {
            $validatedData['total_price'] = $order->book_price * $validatedData['quantity'];
        }
        
        // Update the order
        $order->update($validatedData);
        
        DB::commit();
        
        return response()->json([
            'message' => 'Order updated successfully!',
            'data' => $order->fresh()
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Failed to update order',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function destroy($id)
    {
        $order = Order::find($id);
        
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $order->delete();

        return response()->json(['message' => 'Order deleted successfully']);
    }


    /**
 * Update the order status
 *
 * @param  \Illuminate\Http\Request  $request
 * @param  int  $id
 * @return \Illuminate\Http\Response
 */
public function updateStatus(Request $request, $id)
{
    $order = Order::find($id);

    if (!$order) {
        return response()->json(['message' => 'Order not found'], 404);
    }

    $validator = Validator::make($request->all(), [
        'status' => 'required|string|in:Pending,Paid,Shipped,Cancelled',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    DB::beginTransaction();
    try {
        $order->status = $request->status;
        
        // You can add additional logic based on status changes
        if ($request->status === 'Completed') {
            $order->completed_at = now();
        } elseif ($request->status === 'Cancelled') {
            // If cancelling, you might want to restore stock
            foreach ($order->books as $book) {
                $book->increment('stock', $book->pivot->quantity);
            }
        }
        
        $order->save();
        
        DB::commit();
        
        return response()->json([
            'message' => 'Order status updated successfully!',
            'data' => $order->fresh()
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Failed to update order status',
            'error' => $e->getMessage()
        ], 500);
    }
}
}