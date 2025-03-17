<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WishlistBook extends Model
{
    use HasFactory;

    protected $table = 'wishlist_book'; // Explicitly specify the table name

    protected $fillable = [
        'wishlist_id',
        'book_id',
    ];

    // Relationship to Wishlist
    public function wishlist()
    {
        return $this->belongsTo(Wishlist::class);
    }

    // Relationship to Book
    public function book()
    {
        return $this->belongsTo(BookToSell::class);
    }
}