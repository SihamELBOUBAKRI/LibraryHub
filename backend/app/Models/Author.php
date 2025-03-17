<?php

// app/Models/Author.php
namespace App\Models;

use App\Models\BookToRent;
use App\Models\BookToSell;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Author extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'bio', 'image']; // Allow these fields for mass assignment
    // Relationships

    /**
     * An author has many books available for rent.
     */
    public function booksToRent()
    {
        return $this->hasMany(BookToRent::class);
    }

    /**
     * An author has many books available for sale.
     */
    public function booksToSell()
    {
        return $this->hasMany(BookToSell::class);
    }
}