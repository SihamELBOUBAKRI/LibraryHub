<?php

// app/Models/BookToSell.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookToSell extends Model
{

    use HasFactory; // Ensure this is included

    protected $table = 'book_to_sell'; // Specify the table name if needed

    // Specify which attributes can be mass-assigned
    protected $fillable = [
        'title', 'author_id', 'category_id', 'description',
        'published_year', 'price', 'stock', 'image'
    ];
    
    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function author()
    {
        return $this->belongsTo(Author::class);
    }

    public function wishlists()
    {
        return $this->belongsToMany(Wishlist::class, 'wishlist_book', 'book_id', 'wishlist_id');
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function orders()
    {
        return $this->belongsToMany(Order::class, 'order_book', 'book_id', 'order_id')->withPivot('quantity');
    }
}