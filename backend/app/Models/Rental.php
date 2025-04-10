<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rental extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'book_id',
        'user_id',
        'active_rental_id',
        'rental_date',
        'due_date',
        'return_date',
        'days_late'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'rental_date' => 'datetime',
        'due_date' => 'datetime',
        'return_date' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function book()
    {
        return $this->belongsTo(BookToRent::class, 'book_id');
    }

    public function activeRental()
    {
        return $this->belongsTo(ActiveRental::class, 'active_rental_id');
    }

    /**
     * Calculate days late when setting return date
     */
    public function setReturnDateAttribute($value)
    {
        $this->attributes['return_date'] = $value;
        if ($value && $this->due_date) {
            $returnDate = \Carbon\Carbon::parse($value);
            $this->attributes['days_late'] = max(0, $returnDate->diffInDays($this->due_date, false));
        }
    }
}