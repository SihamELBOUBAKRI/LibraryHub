<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\BookToRentController;
use App\Http\Controllers\BookToSellController;
use App\Http\Controllers\RentalController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\MembershipCardController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OverdueController;
use App\Http\Controllers\ActiveRentalController;

// Public Routes
Route::post('/login', [UserController::class, 'login']);
Route::post('/register', [UserController::class, 'register']);
Route::post('/check-email', function (Request $request) {
    $exists = User::where('email', $request->email)->exists();
    return response()->json(['exists' => $exists]);
});
Route::apiResource('users', UserController::class);
Route::apiResource('book-to-sell', BookToSellController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('authors', AuthorController::class);
Route::post('/logout', [UserController::class, 'logout']);

// Protected Routes
Route::middleware('auth:api')->group(function () {
    Route::get('/membership-cards/check-expired', [MembershipCardController::class, 'checkExpiredMemberships']);
        
    Route::apiResource('book-to-rent', BookToRentController::class);
    Route::apiResource('rentals', RentalController::class);
    Route::apiResource('orders', OrderController::class);
    Route::apiResource('membership-cards', MembershipCardController::class);
    Route::apiResource('transactions', TransactionController::class);
    Route::apiResource('wishlists', WishlistController::class);
    Route::apiResource('carts', CartController::class);
    Route::apiResource('overdues', OverdueController::class);
    Route::apiResource('active-rentals', ActiveRentalController::class);

    // Custom Routes
    Route::get('/me', [UserController::class, 'me']);

    // Cart Routes
    Route::post('/users/{userId}/cart', [CartController::class, 'addToCart']); // Add a book to the cart
    Route::get('/users/{userId}/cart', [CartController::class, 'getCart']); // Get the user's cart
    Route::delete('/users/{userId}/cart/{bookId}', [CartController::class, 'removeFromCart']); // Remove a book from the cart

    // Wishlist Routes
    Route::post('/users/{userId}/wishlist', [WishlistController::class, 'addToWishlist']); // Add a book to the wishlist
    Route::get('/users/{userId}/wishlist', [WishlistController::class, 'getWishlist']); // Get the user's wishlist
    Route::delete('/users/{userId}/wishlist/{bookId}', [WishlistController::class, 'removeFromWishlist']); // Remove a book from the wishlist

    // Purchase Routes (if needed)
    Route::get('/users/{userId}/purchases', [PurchaseController::class, 'getPurchases']); // Get user's purchases
});






// User Routes
// GET /api/users: Get all users.

// GET /api/users/{id}: Get a specific user.

// POST /api/users: Create a new user.

// PUT /api/users/{id}: Update a user.

// DELETE /api/users/{id}: Delete a user.

// 2. Category Routes
// GET /api/categories: Get all categories.

// GET /api/categories/{id}: Get a specific category.

// POST /api/categories: Create a new category.

// PUT /api/categories/{id}: Update a category.

// DELETE /api/categories/{id}: Delete a category.

// 3. Author Routes
// GET /api/authors: Get all authors.

// GET /api/authors/{id}: Get a specific author.

// POST /api/authors: Create a new author.

// PUT /api/authors/{id}: Update an author.

// DELETE /api/authors/{id}: Delete an author.

// 4. Book to Rent Routes
// GET /api/book-to-rent: Get all books available for rent.

// GET /api/book-to-rent/{id}: Get a specific book available for rent.

// POST /api/book-to-rent: Create a new book available for rent.

// PUT /api/book-to-rent/{id}: Update a book available for rent.

// DELETE /api/book-to-rent/{id}: Delete a book available for rent.

// 5. Book to Sell Routes
// GET /api/book-to-sell: Get all books available for sale.

// GET /api/book-to-sell/{id}: Get a specific book available for sale.

// POST /api/book-to-sell: Create a new book available for sale.

// PUT /api/book-to-sell/{id}: Update a book available for sale.

// DELETE /api/book-to-sell/{id}: Delete a book available for sale.

// 6. Rental Routes
// GET /api/rentals: Get all rentals.

// GET /api/rentals/{id}: Get a specific rental.

// POST /api/rentals: Create a new rental.

// PUT /api/rentals/{id}: Update a rental.

// DELETE /api/rentals/{id}: Delete a rental.

// 7. Order Routes
// GET /api/orders: Get all orders.

// GET /api/orders/{id}: Get a specific order.

// POST /api/orders: Create a new order.

// PUT /api/orders/{id}: Update an order.

// DELETE /api/orders/{id}: Delete an order.

// 8. Membership Card Routes
// GET /api/membership-cards: Get all membership cards.

// GET /api/membership-cards/{id}: Get a specific membership card.

// POST /api/membership-cards: Create a new membership card.

// PUT /api/membership-cards/{id}: Update a membership card.

// DELETE /api/membership-cards/{id}: Delete a membership card.

// 9. Transaction Routes
// GET /api/transactions: Get all transactions.

// GET /api/transactions/{id}: Get a specific transaction.

// POST /api/transactions: Create a new transaction.

// PUT /api/transactions/{id}: Update a transaction.

// DELETE /api/transactions/{id}: Delete a transaction.

// 10. Wishlist Routes
// GET /api/wishlists: Get all wishlists.

// GET /api/wishlists/{id}: Get a specific wishlist.

// POST /api/wishlists: Create a new wishlist.

// PUT /api/wishlists/{id}: Update a wishlist.

// DELETE /api/wishlists/{id}: Delete a wishlist.

// 11. Cart Routes
// GET /api/carts: Get all carts.

// GET /api/carts/{id}: Get a specific cart.

// POST /api/carts: Create a new cart.

// PUT /api/carts/{id}: Update a cart.

// DELETE /api/carts/{id}: Delete a cart.

// 12. Overdue Routes
// GET /api/overdues: Get all overdue records.

// GET /api/overdues/{id}: Get a specific overdue record.

// POST /api/overdues: Create a new overdue record.

// PUT /api/overdues/{id}: Update an overdue record.

// DELETE /api/overdues/{id}: Delete an overdue record.

// 13. Active Rental Routes
// GET /api/active-rentals: Get all active rentals.

// GET /api/active-rentals/{id}: Get a specific active rental.

// POST /api/active-rentals: Create a new active rental.

// PUT /api/active-rentals/{id}: Update an active rental.

// DELETE /api/active-rentals/{id}: Delete an active rental