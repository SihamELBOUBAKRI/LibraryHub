<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\BookToSell;
use App\Models\BookPurchase;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class BookPurchaseController extends Controller
{
    /**
     * Display a listing of the user's book purchases.
     *
     * @return \Illuminate\Http\Response
     */

     // app/Http/Controllers/BookPurchaseController.php

        public function index()
        {
            // Fix the incorrect ->with() usage - it should be on the query builder, not the collection
            return BookPurchase::with('book')->latest()->get();
        }

        public function getuserpurchases($userId)
        {
            $purchases = BookPurchase::with('book')
                        ->where('user_id', $userId)
                        ->get();

            return response()->json($purchases);
        }

        public function show($id)
        {
            $purchase = BookPurchase::with('book')->findOrFail($id);
            return response()->json($purchase);
        }

    /**
     * Store a newly created book purchase in the database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validatedData=$request->validate([
            'user_id' => 'required|exists:users,id',
            'book_id' => 'required|exists:book_to_sell,id',
            'quantity' => 'required|integer|min:1',
            'price_per_unit' => 'required|numeric',
            'total_price' => 'required|numeric',
            'purchase_date' => 'required|date',
            'payment_method' => 'required|string',
            'payment_status' => 'required|in:pending,completed,failed',
        ]);

        // Calculate total price if not provided
        $total_price = $request->total_price ?? ($request->price_per_unit * $request->quantity);

        $purchase = BookPurchase::create([
            'user_id' => $validatedData['user_id'],
            'book_id' => $validatedData['book_id'],
            'quantity' => $validatedData['quantity'],
            'price_per_unit' => $validatedData['price_per_unit'],
            'total_price' => $total_price,
            'purchase_date' => $validatedData['purchase_date'],
            'payment_method' => $validatedData['payment_method'],
            'payment_status' => $validatedData['payment_status'],
            'transaction_id' => $validatedData['transaction_id'] ?? null,
        ]);

        return response()->json($purchase, 201);
    }


    /**
     * Update the specified book purchase in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        
        try {
            $purchase = BookPurchase::findOrFail($id);

            // Only validate fields that are present in the request
            $validated = $request->validate([
                'user_id' => 'sometimes|exists:users,id',
                'book_id' => 'sometimes|exists:book_to_sell,id',
                'quantity' => 'sometimes|integer|min:1',
                'price_per_unit' => 'sometimes|numeric|min:0',
                'total_price' => 'sometimes|numeric|min:0',
                'purchase_date' => 'sometimes|date',
                'payment_method' => 'sometimes|string',
                'payment_status' => 'sometimes|in:pending,completed,failed',
                'transaction_id' => 'sometimes|string',
            ]);

            // Update only the fields that were provided
            foreach ($validated as $key => $value) {
                $purchase->{$key} = $value;
            }

            // Recalculate total price if quantity or price_per_unit was updated
            if (isset($validated['quantity']) || isset($validated['price_per_unit'])) {
                $purchase->total_price = $purchase->quantity * $purchase->price_per_unit;
            }

            $purchase->save();

            DB::commit();
    
            return response()->json([
                'success' => true,
                'message' => 'Book purchase updated successfully',
                'data' => $purchase
            ]);
    
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('BookPurchase update error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update book purchase: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified book purchase from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $purchase = BookPurchase::findOrFail($id);
        $purchase->delete();

        return response()->json(['message' => 'Purchase deleted successfully']);
    }
}
