<?php

// app/Models/Order.php
namespace App\Models;

use App\Models\CartItem;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function books()
    {
        return $this->belongsToMany(BookToSell::class, 'order_book', 'order_id', 'book_id')->withPivot('quantity');
    }
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
    public function cart()
    {
        return $this->belongsTo(CartItem::class);
    }
}