<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    // Specify which attributes can be mass-assigned
    protected $fillable = [
        'user_id',
    ];

    // Relationships

    /**
     * Get the user that owns the cart.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the cart items for the cart.
     */
    public function items()
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Get the books in the cart through the cart items.
     */
    public function books()
    {
        return $this->hasManyThrough(
            BookToSell::class, // Target model (BookToSell)
            CartItem::class,   // Intermediate model (CartItem)
            'cart_id',        // Foreign key on CartItem table
            'id',             // Foreign key on BookToSell table
            'id',             // Local key on Cart table
            'book_id'         // Local key on CartItem table
        );
    }
}