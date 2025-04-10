<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MembershipCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'card_number',
        'issued_on',
        'valid_until',
        'membership_type',
        'amount_paid',
        'payment_method',
        'transaction_id',
        'payment_status', 
        'card_holder_name',     
        'card_last_four',       
        'expiration_date',      
        'billing_address',
    ];

    /**
     * A membership card belongs to a user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * A membership card has many transactions.
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
