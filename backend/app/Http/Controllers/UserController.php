<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    // Get all users
    public function index()
    {
        try {
            $users = User::all();
            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch users: ' . $e->getMessage()], 500);
        }
    }
    public function updateProfile(Request $request)
{
    $user = Auth::user(); // Get the authenticated user

    $validator = Validator::make($request->all(), [
        'name' => 'sometimes|string|max:255',
        'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
        'address' => 'nullable|string|max:255',
        'tele' => 'nullable|string|max:20',
        'cin' => 'sometimes|string|max:20|unique:users,cin,' . $user->id,
        'birthyear' => 'nullable|date_format:Y-m-d',
    ]);

    if ($validator->fails()) {
        return response()->json(['error' => $validator->errors()], 400);
    }

    try {
        $validatedData = $validator->validated();
        
        // Prevent updates to role and isamember
        unset($validatedData['role'], $validatedData['isamember']);

        $user->update($validatedData);

        return response()->json(['message' => 'Profile updated successfully', 'user' => $user]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to update profile: ' . $e->getMessage()], 500);
    }
}
public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required|string|min:8',
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['error' => 'Invalid email or password'], 401);
    }

    // Generate token (if using Laravel Sanctum or Passport)
    $token = $user->createToken('authToken')->plainTextToken;

    return response()->json([
        'message' => 'Login successful',
        'user' => $user,
        'token' => $token
    ]);
}

public function register(Request $request)
{
    $validatedData = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:8|confirmed',
        'cin' => 'required|string|max:20|unique:users',
        'address' => 'nullable|string|max:255',
        'tele' => 'nullable|string|max:20',
        'birthdate' => 'nullable|date_format:Y-m-d', // Changed from birthyear to birthdate
    ]);

    try {
        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'cin' => $validatedData['cin'],
            'address' => $validatedData['address'] ?? null,
            'tele' => $validatedData['tele'] ?? null,
            'birthyear' => $validatedData['birthdate'] ?? null, // Map birthdate to birthyear
            'role' => 'customer',
            'isamember' => false,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'User created successfully',
            'user' => $user,
            'token' => $user->createToken('authToken')->plainTextToken
        ], 201);

    } catch (\Exception $e) {
        return response()->json([
            'status' => false,
            'message' => 'User registration failed',
            'error' => $e->getMessage()
        ], 500);
    }
}


public function changePassword(Request $request)
{
    $request->validate([
        'current_password' => 'required',
        'new_password' => 'required|min:8|confirmed', // 'new_password_confirmation' required
    ]);

    $user = Auth::user(); // Get authenticated user

    // Check if the current password matches
    if (!Hash::check($request->current_password, $user->password)) {
        return response()->json(['error' => 'Current password is incorrect'], 400);
    }

    // Update password
    $user->password = Hash::make($request->new_password);
    $user->save();

    return response()->json(['message' => 'Password changed successfully']);
}


public function logout(Request $request)
{
    $request->user()->tokens()->delete();
    return response()->json(['message' => 'Logged out successfully'], 200);
}


    // Get a specific user
    public function show($id)
    {
        try {
            $user = User::findOrFail($id);
            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json(['error' => 'User not found'], 404);
        }
    }

    // Create a new user
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'address' => 'nullable|string|max:255',
            'tele' => 'nullable|string|max:20',
            'cin' => 'required|string|max:20|unique:users',
            'birthyear' => 'nullable|date_format:Y-m-d', // Accepts only valid dates in YYYY-MM-DD
        ]);
    
        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }
    
        try {
            $validatedData = $validator->validated();
            $validatedData['role'] = 'customer'; // Set the role automatically to 'customer'
            $validatedData['password'] = Hash::make($validatedData['password']);
            $validatedData['isamember'] = false; // Default to false, cannot be set by user
    
            $user = User::create($validatedData);
    
            return response()->json(['message' => 'User registered successfully', 'user' => $user], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create user: ' . $e->getMessage()], 500);
        }
    }
    

    // Update a user
    public function update(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
                'password' => 'sometimes|string|min:8',
                'address' => 'nullable|string|max:255',
                'tele' => 'nullable|string|max:20',
                'cin' => 'sometimes|string|max:20|unique:users,cin,' . $user->id,
                'birthyear' => 'nullable|date_format:Y-m-d', 
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 400);
            }
            

            $validatedData = $validator->validated();

            if (isset($validatedData['password'])) {
                $validatedData['password'] = Hash::make($validatedData['password']);
            }

            // Ensure isamember is not updated by user
            unset($validatedData['isamember']);

            $user->update($validatedData);

            return response()->json(['message' => 'User updated successfully', 'user' => $user]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update user: ' . $e->getMessage()], 500);
        }
    }

    // Delete a user
    public function destroy($id)
    {
        try {
            User::destroy($id);
            return response()->noContent();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete user: ' . $e->getMessage()], 500);
        }
    }

    public function me(Request $request)
{
    return response()->json($request->user());
}


public function verifyPassword(Request $request)
{
    // Get the currently authenticated user
    $user = auth()->user();

    // Get the password input from the request
    $password = $request->input('password');

    // Check if the provided password matches the stored (hashed) password
    if (Hash::check($password, $user->password)) {
        return response()->json(['success' => true]);
    }

    // If the password doesn't match, return an error response
    return response()->json(['success' => false, 'message' => 'Incorrect password']);
}

public function deleteAccount(Request $request)
{
    // First, verify the user's password
    $password = $request->input('password');
    $user = auth()->user();

    // Check if the password is correct
    if (!Hash::check($password, $user->password)) {
        return response()->json(['success' => false, 'message' => 'Incorrect password'], 400);
    }

    // If the password matches, proceed to delete the account
    try {
        // Delete the user record
        $user->delete();

        // Optionally, log the user out by deleting their tokens
        $request->user()->tokens()->delete();

        return response()->json(['success' => true, 'message' => 'Account deleted successfully']);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'error' => 'Failed to delete account: ' . $e->getMessage()], 500);
    }
}

}