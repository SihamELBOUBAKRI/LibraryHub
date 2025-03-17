<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wishlist extends Model
{
    use HasFactory;

    protected $fillable = ['user_id'];

    // Relationship to User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship to Books (many-to-many)
    public function books()
    {
        return $this->belongsToMany(BookToSell::class, 'wishlist_book', 'wishlist_id', 'book_id');
    }
}