<?php

namespace App\Http\Controllers;

use App\Models\MembershipCard;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\Transaction;


class MembershipCardController extends Controller
{
    /**
     * Display a listing of membership cards.
     */
    public function index(Request $request)
    {
        try {
            $query = MembershipCard::with('user');
            $membershipCards = $query->latest()->get();
            
            return response()->json($membershipCards);
            
        } catch (\Exception $e) {
            Log::error('Membership card index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve membership cards'
            ], 500);
        }
    }

    /**
     * Store a new membership card.
     */
  /**
 * Get membership card for a specific user
 */
public function getUserMembership($userId)
{
    try {
        // Find the user first to ensure they exist
        $user = User::findOrFail($userId);
        
        // Get the membership card with user relationship
        $membershipCard = MembershipCard::with('user')
            ->where('user_id', $userId)
            ->first();

        if (!$membershipCard) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'User does not have a membership card'
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $membershipCard
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'message' => 'User not found'
        ], 404);
    } catch (\Exception $e) {
        Log::error('Get user membership error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve user membership'
        ], 500);
    }
}

public function store(Request $request)
{
    DB::beginTransaction();
    
    try {
        // Base validation rules
        $validationRules = [
            'user_id' => 'required|exists:users,id|unique:membership_cards,user_id',
            'membership_type' => 'required|in:monthly,yearly',
            'payment_method' => 'required|in:credit card,bank_transfer,cash',
            'payment_status' => 'required|in:pending,completed,failed',
        ];

        // Add conditional validation for credit card fields
        if ($request->payment_method === 'credit card') {
            $validationRules = array_merge($validationRules, [
                'card_holder_name' => 'required|string',
                'card_last_four' => 'required|string|size:4',
                'expiration_date' => ['required', 'string', 'regex:/^(0[1-9]|1[0-2])\/([0-9]{2})$/'],
                'billing_address' => 'required|string',
            ]);
        }

        // Validate incoming data
        $validated = $request->validate($validationRules);

        // Ensure the user exists and is eligible for membership
        $user = User::findOrFail($validated['user_id']);
        
        // Check if the user already has a membership card
        if ($user->membershipCard) {
            throw new \Exception('User already has an active membership card');
        }

        // Generate random card number and transaction ID
        $cardNumber = strtoupper(bin2hex(random_bytes(8)));
        $transactionId = strtoupper(bin2hex(random_bytes(8)));

        // Set the payment amount based on the membership type
        $amountPaid = $validated['membership_type'] === 'yearly' ? 200.00 : 20.00;
        
        // Calculate the 'valid_until' based on membership type
        $validUntil = now()->addMonths($validated['membership_type'] === 'yearly' ? 12 : 1);

        // Prepare membership card data
        $membershipData = [
            'user_id' => $validated['user_id'],
            'card_number' => $cardNumber,
            'issued_on' => now(),
            'valid_until' => $validUntil,
            'membership_type' => $validated['membership_type'],
            'amount_paid' => $amountPaid,
            'currency' => 'USD',
            'payment_method' => $validated['payment_method'],
            'transaction_id' => $transactionId,
            'payment_status' =>'completed',
        ];

        // Add credit card info only if payment method is credit_card
        if ($request->payment_method === 'credit card') {
            $membershipData = array_merge($membershipData, [
                'card_holder_name' => $validated['card_holder_name'],
                'card_last_four' => $validated['card_last_four'],
                'expiration_date' => $validated['expiration_date'],
                'billing_address' => $validated['billing_address'],
            ]);
        }

        // Create the membership card
        $membershipCard = MembershipCard::create($membershipData);

        // Mark the user as a member
        $user->isamember = true;
        $user->save();

        // Create a transaction for the membership payment
        Transaction::create([
            'user_id' => $validated['user_id'],
            'membership_card_id' => $membershipCard->id,
            'amount' => $amountPaid,
            'payment_method' => $validated['payment_method'],
            'payment_status' => $validated['payment_status'],
            'transaction_id' => $transactionId,
            'transaction_type' => 'Membership',
        ]);

        DB::commit();
    
        return response()->json([
            'success' => true,
            'data' => $membershipCard
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Membership card store error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to store membership card: ' . $e->getMessage()
        ], 500);
    }
}


     

    /**
     * Display the specified membership card.
     */
    public function show($id)
    {
        try {
            $membershipCard = MembershipCard::with('user')->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $membershipCard
            ]);
            
        } catch (\Exception $e) {
            Log::error('Membership card show error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Membership card not found'
            ], 404);
        }
    }

    /**
     * Update the specified membership card.
     */
    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        
        try {
            $membershipCard = MembershipCard::findOrFail($id);
            
            $validated = $request->validate([
                'card_number' => 'nullable|unique:membership_cards,card_number,' . $membershipCard->id,
                'issued_on' => 'nullable|date',
                'valid_until' => 'nullable|date',
                'membership_type' => 'nullable|in:monthly,yearly',
                'amount_paid' => 'nullable|numeric|min:0',
                'payment_method' => 'nullable|string',
                'transaction_id' => 'nullable|string',
                'payment_status' => 'nullable|in:pending,completed,failed',
                'card_holder_name' => 'nullable|string',
                'card_last_four' => 'nullable|string',
                'expiration_date' => 'nullable|string',
                'billing_address' => 'nullable|string',
            ]);

            $membershipCard->update($validated);
    
            DB::commit();
    
            return response()->json([
                'success' => true,
                'message' => 'Membership card updated successfully',
                'data' => $membershipCard
            ]);
    
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Membership card update error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update membership card'
            ], 500);
        }
    }

    /**
     * Remove the specified membership card.
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        
        try {
            $membershipCard = MembershipCard::findOrFail($id);
            
            // Prevent deletion of active membership cards
            if ($membershipCard->payment_status === 'completed') {
                throw new \Exception('Cannot delete completed membership cards');
            }
            
            $membershipCard->delete();
    
            DB::commit();
    
            return response()->json([
                'success' => true,
                'message' => 'Membership card deleted successfully'
            ]);
    
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Membership card destroy error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete membership card: ' . $e->getMessage()
            ], 500);
        }
    }
}
