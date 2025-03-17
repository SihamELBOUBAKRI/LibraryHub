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
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:8|confirmed',
        'cin' => 'required|string|max:20|unique:users', // Add validation for 'cin'
        'address' => 'nullable|string|max:255', // Optional
        'tele' => 'nullable|string|max:20', // Optional
        'birthyear' => 'nullable|date_format:Y-m-d', // Optional
    ]);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'cin' => $request->cin, // Include 'cin'
        'address' => $request->address, // Include 'address'
        'tele' => $request->tele, // Include 'tele'
        'birthyear' => $request->birthyear, // Include 'birthyear'
        'role' => 'customer', // Default role
        'isamember' => false, // Default value
    ]);

    return response()->json($user, 201);
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
            return response()->json(['error' => $validator->errors()], 400);
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
}