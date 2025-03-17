<?php
namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    // Get all transactions
    public function index()
    {
        return Transaction::all();
    }

    // Get a specific transaction
    public function show($id)
    {
        return Transaction::findOrFail($id);
    }

    // Create a new transaction for an order
    public function store(Request $request)
    {
        // Validate incoming request data for transaction creation
        $validatedData = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric',
            'payment_method' => 'required|in:Credit Card,PayPal,Bank Transfer,Cash on Delivery',
            'status' => 'required|in:Pending,Completed,Failed,Refunded', // Payment status
        ]);

        // Get the order related to the transaction
        $order = Order::findOrFail($validatedData['order_id']);
        
        // Check if the order's total matches the transaction amount
        if ($order->total_price !== $validatedData['amount']) {
            return response()->json(['message' => 'Transaction amount does not match the order total'], 400);
        }

        // Start a database transaction to ensure consistency
        DB::beginTransaction();

        try {
            // Create the transaction
            $transaction = Transaction::create([
                'order_id' => $validatedData['order_id'],
                'user_id' => $order->user_id,
                'amount' => $validatedData['amount'],
                'payment_method' => $validatedData['payment_method'],
                'status' => $validatedData['status'],
                'transaction_date' => now(), // Store the current timestamp as the transaction date
            ]);

            // Optionally, you can update the order status after payment
            if ($validatedData['status'] === 'Completed') {
                $order->status = 'Paid';
                $order->save();
            }

            // Commit the transaction
            DB::commit();

            return response()->json($transaction, 201); // Return the created transaction with a 201 status

        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollBack();
            return response()->json(['message' => 'Error creating transaction', 'error' => $e->getMessage()], 500);
        }
    }

    // Update a transaction (typically to update payment status or other details)
    public function update(Request $request, $id)
    {
        // Validate the incoming request data
        $validatedData = $request->validate([
            'amount' => 'nullable|numeric',
            'payment_method' => 'nullable|in:Credit Card,PayPal,Bank Transfer,Cash on Delivery',
            'status' => 'nullable|in:Pending,Completed,Failed,Refunded',
        ]);

        // Find and update the transaction
        $transaction = Transaction::findOrFail($id);
        $transaction->update($validatedData);
        return response()->json($transaction);
    }

    // Delete a transaction
    public function destroy($id)
    {
        $transaction = Transaction::findOrFail($id);

        // If the transaction is associated with a paid order, you may need to handle it differently
        // For instance, not deleting a completed transaction
        if ($transaction->status === 'Completed') {
            return response()->json(['message' => 'Cannot delete a completed transaction'], 400);
        }

        $transaction->delete();
        return response()->noContent();
    }
}
