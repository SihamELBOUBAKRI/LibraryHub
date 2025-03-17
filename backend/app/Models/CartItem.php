<?php

namespace App\Models;

use App\Models\Cart;
use App\Models\Order;
use App\Models\BookToSell;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CartItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'cart_id',
        'book_id',
        'quantity',
        'total_amount',
    ];

    /**
     * Get the cart that owns the cart item.
     */
    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }
    
    public function order()
    {
        return $this->hasOne(Order::class);
    }

    /**
     * Get the book associated with the cart item.
     */
    public function book()
    {
        return $this->belongsTo(BookToSell::class);
    }
}
