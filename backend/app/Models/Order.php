<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    // Allow mass assignment
    protected $fillable = [
        'user_id',
        'cart_id',  // Nullable if ordering directly
        'book_id',  // Nullable if ordering from cart
        'quantity', // Nullable if ordering from cart
        'book_price', // Nullable if ordering from cart
        'total_price',
        'payment_method',
        'shipping_address',
        'notes',
        'card_holder_name',
        'card_last_four',
        'expiration_date',
        'transaction_id',
        'shipping_tracking_number',
        'expected_delivery_date',
        'status',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

 

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function cart()
    {
        return $this->belongsTo(CartItem::class);
    }
    
    public function books()
{
    return $this->belongsToMany(BookToSell::class, 'order_book', 'order_id', 'book_id')
                ->withPivot('quantity', 'book_price');
}

}
