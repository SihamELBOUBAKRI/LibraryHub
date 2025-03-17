<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Overdue extends Model
{
    use HasFactory;

    protected $fillable = [
        'rental_id',
        'penalty_amount',
        'due_date',
    ];

    /**
     * An overdue record belongs to a user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * An overdue record belongs to a rented book.
     */
    public function bookToRent()
    {
        return $this->belongsTo(BookToRent::class);
    }
}
