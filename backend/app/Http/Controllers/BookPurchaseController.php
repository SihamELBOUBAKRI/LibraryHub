<?php

namespace App\Http\Controllers;

use App\Models\BookPurchase;
use App\Models\BookToSell;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookPurchaseController extends Controller
{
    /**
     * Display a listing of the user's book purchases.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $user = Auth::user();  // Get the authenticated user
        $purchases = BookPurchase::where('user_id', $user->id)->get();

        return response()->json($purchases);
    }

    /**
     * Store a newly created book purchase in the database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:book_to_sell,id',
            'quantity' => 'required|integer|min:1',
            'price_per_unit' => 'required|numeric',
            'total_price' => 'required|numeric',
            'purchase_date' => 'required|date',
            'payment_method' => 'required|string',
            'payment_status' => 'required|in:pending,completed,failed',
        ]);

        // Calculate total price if not provided
        if (!$request->has('total_price')) {
            $total_price = $request->price_per_unit * $request->quantity;
        }

        $purchase = BookPurchase::create([
            'book_id' => $request->book_id,
            'user_id' => Auth::id(),
            'quantity' => $request->quantity,
            'price_per_unit' => $request->price_per_unit,
            'total_price' => $total_price,
            'purchase_date' => $request->purchase_date,
            'payment_method' => $request->payment_method,
            'payment_status' => $request->payment_status,
            'transaction_id' => $request->transaction_id ?? null,
        ]);

        return response()->json($purchase, 201);
    }

    /**
     * Display the specified book purchase.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $purchase = BookPurchase::findOrFail($id);
        return response()->json($purchase);
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
        $request->validate([
            'payment_status' => 'required|in:pending,completed,failed',
            'transaction_id' => 'nullable|string',
        ]);

        $purchase = BookPurchase::findOrFail($id);
        $purchase->payment_status = $request->payment_status;
        $purchase->transaction_id = $request->transaction_id ?? $purchase->transaction_id;
        $purchase->save();

        return response()->json($purchase);
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
