<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MembershipCard;
use App\Models\User;
use Illuminate\Routing\Controller;
use Carbon\Carbon;

class MembershipCardController extends Controller
{
    // Get all membership cards
    public function index()
    {
        return response()->json(MembershipCard::all(), 200);
    }

    // Get a specific membership card
    public function show($id)
    {
        $membership = MembershipCard::find($id);
        return $membership
            ? response()->json($membership, 200)
            : response()->json(['message' => 'Membership not found'], 404);
    }

    // Create a new membership card
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'card_number' => 'required|string|unique:membership_cards',
            'issued_on' => 'required|date',
            'valid_until' => 'required|date|after:issued_on',
        ]);

        $membership = MembershipCard::create($validated);

        // Update the user's membership status
        $user = User::find($request->user_id);
        $user->isamember = true;
        $user->save();

        return response()->json([
            'message' => 'Membership card created successfully',
            'membership' => $membership
        ], 201);
    }

    // Update an existing membership card
    public function update(Request $request, $id)
    {
        $membership = MembershipCard::find($id);
        if (!$membership) {
            return response()->json(['message' => 'Membership not found'], 404);
        }

        $validated = $request->validate([
            'card_number' => 'sometimes|required|string|unique:membership_cards,card_number,' . $id,
            'valid_until' => 'sometimes|required|date|after:issued_on',
        ]);

        $membership->update($validated);

        return response()->json([
            'message' => 'Membership card updated successfully',
            'membership' => $membership
        ], 200);
    }

    // Delete a membership card
    public function destroy($id)
    {
        $membership = MembershipCard::find($id);
        if (!$membership) {
            return response()->json(['message' => 'Membership not found'], 404);
        }

        $user = User::find($membership->user_id);
        if ($user) {
            $user->isamember = false; // Remove membership status
            $user->save();
        }

        $membership->delete();
        return response()->json(['message' => 'Membership card deleted successfully'], 204);
    }

    // Check membership expiration and update user status
    public function checkExpiredMemberships()
    {
        $expiredMemberships = MembershipCard::where('valid_until', '<', Carbon::now())->get();

        foreach ($expiredMemberships as $membership) {
            $user = User::find($membership->user_id);
            if ($user) {
                $user->isamember = false; // Expired, remove membership status
                $user->save();
            }
        }

        return response()->json(['message' => 'Checked and updated expired memberships'], 200);
    }
}
