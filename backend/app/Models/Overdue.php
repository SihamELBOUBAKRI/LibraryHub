<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Overdue extends Model
{
    use HasFactory;

    protected $fillable = [
        'active_rental_id',
        'book_id',
        'user_id',
        'penalty_amount',
        'days_overdue',
        'original_due_date',
        'penalty_paid',
        'paid_date'
    ];

    protected $casts = [
        'original_due_date' => 'date',
        'paid_date' => 'date',
        'penalty_paid' => 'boolean'
    ];

    public function activeRental()
    {
        return $this->belongsTo(ActiveRental::class);
    }

    public function book()
    {
        return $this->belongsTo(BookToRent::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}