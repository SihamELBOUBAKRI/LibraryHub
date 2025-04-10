<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Order;
use App\Models\MembershipCard;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TransactionController extends Controller
{
    /**
     * Store a new transaction (either for orders or membership).
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        
        try {
            // Validate incoming data
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'amount' => 'required|numeric|min:0',
                'payment_method' => 'required|in:Credit Card,PayPal,Bank Transfer,Cash on Delivery,Membership Payment',
                'transaction_id' => 'nullable|string',
                'transaction_type' => 'required|in:Order,Membership',
                'order_id' => 'nullable|exists:orders,id',
                'membership_card_id' => 'nullable|exists:membership_cards,id',
            ]);

            // Validate the specific conditions for 'Order' or 'Membership' transaction types
            if ($validated['transaction_type'] === 'Order' && !$validated['order_id']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order ID is required for Order transactions'
                ], 400);
            }

            if ($validated['transaction_type'] === 'Membership' && !$validated['membership_card_id']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Membership Card ID is required for Membership transactions'
                ], 400);
            }

            // Create the transaction
            $transaction = Transaction::create([
                'user_id' => $validated['user_id'],
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'transaction_id' => $validated['transaction_id'],
                'transaction_type' => $validated['transaction_type'],
                'payment_status' => 'Completed', // You can update this after payment confirmation
                'order_id' => $validated['transaction_type'] === 'Order' ? $validated['order_id'] : null,
                'membership_card_id' => $validated['transaction_type'] === 'Membership' ? $validated['membership_card_id'] : null,
            ]);

            DB::commit();
    
            return response()->json([
                'success' => true,
                'data' => $transaction
            ], 201);
    
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction store error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to store transaction: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the transaction status after payment processing.
     */
    public function updateStatus(Request $request, $id)
    {
        DB::beginTransaction();
        
        try {
            // Validate incoming data
            $validated = $request->validate([
                'payment_status' => 'required|in:Pending,Completed,Failed',
            ]);

            // Find the transaction
            $transaction = Transaction::findOrFail($id);

            // Update payment status
            $transaction->payment_status = $validated['payment_status'];
            $transaction->save();

            // Optionally, update related models based on payment status (e.g., marking the order or membership as paid)

            DB::commit();
    
            return response()->json([
                'success' => true,
                'message' => 'Transaction status updated successfully',
                'data' => $transaction
            ]);
    
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction update status error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update transaction status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a listing of transactions.
     */
    public function index(Request $request)
    {
        try {
            $query = Transaction::with(['user', 'order', 'membershipCard']);

            // Apply filters if provided
            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }
            if ($request->has('transaction_type')) {
                $query->where('transaction_type', $request->transaction_type);
            }
            if ($request->has('payment_status')) {
                $query->where('payment_status', $request->payment_status);
            }

            $transactions = $query->latest()->get();

            return response()->json([
                'success' => true,
                'data' => $transactions
            ]);
            
        } catch (\Exception $e) {
            Log::error('Transaction index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve transactions'
            ], 500);
        }
    }
    /**
 * Update a specific transaction (for example, update payment method, amount, etc.).
 */
public function update(Request $request, $id)
{
    DB::beginTransaction();

    try {
        // Validate incoming data
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:Credit Card,PayPal,Bank Transfer,Cash on Delivery',
            'transaction_id' => 'nullable|string',
        ]);

        // Find the transaction
        $transaction = Transaction::findOrFail($id);

        // Update the transaction fields
        $transaction->amount = $validated['amount'];
        $transaction->payment_method = $validated['payment_method'];
        $transaction->transaction_id = $validated['transaction_id'] ?? $transaction->transaction_id; // Optional

        $transaction->save();

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Transaction updated successfully',
            'data' => $transaction
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Transaction update error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to update transaction: ' . $e->getMessage()
        ], 500);
    }
}
/**
 * Delete a transaction.
 */
public function destroy($id)
{
    DB::beginTransaction();

    try {
        // Find the transaction
        $transaction = Transaction::findOrFail($id);

        // Delete the transaction
        $transaction->delete();

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Transaction deleted successfully'
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Transaction delete error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete transaction: ' . $e->getMessage()
        ], 500);
    }
}

public function getUserTransactions($userId)
{
    try {
        $transactions = Transaction::where('user_id', $userId)
            ->with(['order', 'membershipCard'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);

    } catch (\Exception $e) {
        Log::error('getUserTransactions error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve user transactions'
        ], 500);
    }
}




    /**
     * Display the specified transaction.
     */
    public function show($id)
    {
        try {
            $transaction = Transaction::with(['user', 'order', 'membershipCard'])->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $transaction
            ]);
            
        } catch (\Exception $e) {
            Log::error('Transaction show error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        }
    }
}
