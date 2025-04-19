<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CartController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\RentalController;
use App\Http\Controllers\OverdueController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\BookToRentController;
use App\Http\Controllers\BookToSellController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ActiveRentalController;
use App\Http\Controllers\BookPurchaseController;
use App\Http\Controllers\MembershipCardController;
use App\Http\Controllers\BookReservationController;

// ... [other use statements remain the same]

/*------------------------------------------
| 1. AUTHENTICATION ROUTES (Highest Priority)
------------------------------------------*/
Route::post('/login', [UserController::class, 'login']);
Route::post('/register', [UserController::class, 'register']);
Route::post('/logout', [UserController::class, 'logout']);

/*------------------------------------------
| 2. PUBLIC RESOURCE ROUTES (Read-only)
------------------------------------------*/
Route::apiResource('authors', AuthorController::class)->only(['index', 'show']);
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
Route::apiResource('book-to-sell', BookToSellController::class)->only(['index', 'show']);
Route::apiResource('book-to-rent', BookToRentController::class)->only(['index', 'show']);

/*------------------------------------------
| 3. AUTHENTICATED USER ROUTES
------------------------------------------*/
Route::middleware('auth:sanctum')->group(function () {
    
    // User Profile Routes (accessible to all authenticated users)
    Route::get('/me', [UserController::class, 'me']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/change-password', [UserController::class, 'changePassword']);
    Route::post('/verify-password', [UserController::class, 'verifyPassword']);
    Route::delete('/delete-account', [UserController::class, 'deleteAccount']);
    Route::post('/reservations/expire-old', [BookReservationController::class, 'expireOldReservations']);
Route::post('/reservations/cancel-expired', [BookReservationController::class, 'cancelExpiredReservations']);
    
    Route::apiResource('carts', CartController::class);
    Route::get('users/{userId}/cart', [CartController::class, 'getCart']);
    Route::post('users/{userId}/cart', [CartController::class, 'addToCart']);
    Route::delete('users/{userId}/cart/{bookId}', [CartController::class, 'removeFromCart']);

    Route::apiResource('overdues', OverdueController::class);
    Route::get('users/{userId}/overdues', [OverdueController::class, 'getUserOverdues']);

    Route::apiResource('rentals', RentalController::class);
    Route::get('users/{userId}/rentals', [RentalController::class, 'getUserRentals']);

    Route::apiResource('active-rentals', ActiveRentalController::class);
    Route::get('users/{userId}/active-rentals', [ActiveRentalController::class, 'getUserActiveRentals']);
    Route::put('/active-rentals/{id}/status', [ActiveRentalController::class, 'updateStatus']);

    Route::apiResource('wishlists', WishlistController::class);
    Route::get('users/{userId}/wishlist', [WishlistController::class, 'getWishlist']);
    Route::post('users/{userId}/wishlist', [WishlistController::class, 'addToWishlist']);
    Route::DELETE('users/{userId}/wishlist/{bookId}', [WishlistController::class, 'removeFromWishlist']);

    
    // Order Processing (accessible to all authenticated users)
    Route::apiResource('orders', OrderController::class);
    Route::get('/users/{userId}/orders', [OrderController::class, 'getUserOrders']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);

    Route::apiResource('transactions', TransactionController::class)->except(['create', 'edit']);
    Route::put('/transactions/{id}/status', [TransactionController::class, 'updateStatus']);
    Route::get('/users/{userId}/transactions', [TransactionController::class, 'getUserTransactions']);

    Route::apiResource('purchases', BookPurchaseController::class)->except(['create', 'edit']);
    Route::get('/users/{userId}/purchases', [BookPurchaseController::class, 'getuserpurchases']);
    
    // Book Rental System (accessible to all authenticated users)
    Route::apiResource('reservations', BookReservationController::class);
    Route::post('/reservations/{id}/pick', [BookReservationController::class, 'markAsPicked']);
    Route::get('/reservations/status/{status}', [BookReservationController::class, 'byStatus']);
    Route::get('/users/{userId}/reservations', [BookReservationController::class, 'getUserReservations']);
    Route::get('/users/{userId}/membership-cards', [MembershipCardController::class, 'getUserMembership']); // Changed endpoint

    // ... [other user routes remain the same]

    /*------------------------------------------
    | ADMIN-ONLY ROUTES
    | Handled by controller-level authorization
    ------------------------------------------*/
    Route::middleware('auth:sanctum')->group(function () {
        // Resource Management
        Route::apiResource('authors', AuthorController::class)->except(['index', 'show']);
        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
        Route::apiResource('book-to-sell', BookToSellController::class)->except(['index', 'show']);
        Route::apiResource('book-to-rent', BookToRentController::class)->except(['index', 'show']);
        
        // System Management
        Route::delete('/rentals/{id}', [RentalController::class, 'destroy']);
        Route::get('/rentals/stats', [RentalController::class, 'getStats']);
        
        // User Management
        Route::apiResource('users', UserController::class);
        // Membership & Transactions
        Route::apiResource('membership-cards', MembershipCardController::class);

    });
    
});