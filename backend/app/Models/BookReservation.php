<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookReservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'membership_card_id',
        'book_id',
        'reservation_code',
        'payment_method',
        'card_holder_name',
        'card_last_four',
        'card_expiration',
        'status',
        'pickup_deadline',
        'picked_up_at',
        'staff_notes'
    ];

    protected $casts = [
        'pickup_deadline' => 'datetime',
        'picked_up_at' => 'datetime',
    ];

    // Status constants
    public const STATUS_WAITING = 'waiting';
    public const STATUS_PICKED = 'picked';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_CANCELLED = 'cancelled';

    // Payment method constants
    public const PAYMENT_CASH = 'cash';
    public const PAYMENT_CREDIT_CARD = 'credit_card';

    /**
     * Get the user who made the reservation.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the membership card used for the reservation.
     */
    public function membershipCard()
    {
        return $this->belongsTo(MembershipCard::class);
    }

    /**
     * Get the book that was reserved.
     */
    public function book()
    {
        return $this->belongsTo(BookToRent::class, 'book_id');
    }

    /**
     * Get the active rental associated with this reservation (if picked).
     */
    public function activeRental()
    {
        return $this->hasOne(ActiveRental::class, 'reservation_id');
    }

    /**
     * Scope a query to only include waiting reservations.
     */
    public function scopeWaiting($query)
    {
        return $query->where('status', self::STATUS_WAITING);
    }

    /**
     * Scope a query to only include picked reservations.
     */
    public function scopePicked($query)
    {
        return $query->where('status', self::STATUS_PICKED);
    }

    /**
     * Check if the reservation is expired.
     */
    public function isExpired(): bool
    {
        return $this->status === self::STATUS_EXPIRED || 
               ($this->status === self::STATUS_WAITING && $this->pickup_deadline->isPast());
    }

    /**
     * Check if the reservation can be picked up.
     */
    public function canBePicked(): bool
    {
        return $this->status === self::STATUS_WAITING && !$this->pickup_deadline->isPast();
    }
}