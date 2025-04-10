<?php

// app/Models/TrackBookPurchase.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookPurchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'book_id', 'quantity', 'total_price', 
        'user_id', 'price_per_unit', 'purchase_date', 
        'payment_method', 'payment_status', 'transaction_id'
    ];
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function book()
    {
        return $this->belongsTo(BookToSell::class, 'book_id');
    }
    public function user()
{
    return $this->belongsTo(User::class);
}
}
