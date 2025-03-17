<?php

namespace App\Models;

use App\Models\BookToRent;
use App\Models\BookToSell;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name'];
    // Relationships

    /**
     * A category has many books available for rent.
     */
    public function booksToRent()
    {
        return $this->hasMany(BookToRent::class);
    }

    /**
     * A category has many books available for sale.
     */
    public function booksToSell()
    {
        return $this->hasMany(BookToSell::class);
    }
}