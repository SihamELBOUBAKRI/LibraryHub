<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class MembershipCard extends Model
{
    // Relationships
    use HasFactory;

    protected $fillable = [
        'user_id', 'card_number', 'issued_on', 'valid_until'
    ];
    /**
     * A membership card belongs to a user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

