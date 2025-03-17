<?php

// app/Models/TrackBookPurchase.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrackBookPurchase extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'book_id', 'quantity', 'total_price'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
