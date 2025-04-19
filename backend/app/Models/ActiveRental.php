<?php

namespace App\Models;

use App\Models\BookToRent;
use App\Models\MembershipCard;
use App\Models\BookReservation;
use Illuminate\Foundation\Auth\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ActiveRental extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'book_id',
        'reservation_id',
        'membership_card_number',
        'payment_method',
        'card_holder_name',
        'card_last_four',
        'card_expiration',
        'status',
        'rental_date',
        'due_date'
    ];

    protected $casts = [
        'rental_date' => 'date',
        'due_date' => 'date'
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(BookToRent::class, 'book_id');
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(BookReservation::class, 'reservation_id');
    }

    public function membershipCard(): BelongsTo
    {
        return $this->belongsTo(MembershipCard::class, 'membership_card_number', 'card_number');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue');
    }

    // Helper methods
    public function isReservationBased(): bool
    {
        return !is_null($this->reservation_id);
    }

    public function isWalkIn(): bool
    {
        return is_null($this->reservation_id);
    }

    public function markAsReturned()
    {
        return $this->update(['status' => 'returned']);
    }

    public function markAsOverdue()
    {
        return $this->update(['status' => 'overdue']);
    }
}