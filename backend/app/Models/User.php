<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'address',
        'tele',
        'cin',
        'birthyear',
        'isamember',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'isamember' => 'boolean',
    ];

    // Relationships

    /**
     * Get the rentals associated with the user.
     */
    public function rentals()
    {
        return $this->hasMany(Rental::class);
    }

    /**
     * Get the active rentals associated with the user.
     */
    public function activeRentals()
    {
        return $this->hasMany(ActiveRental::class);
    }

    /**
     * Get the orders associated with the user.
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the wishlist associated with the user.
     */
    public function wishlist()
    {
        return $this->hasOne(Wishlist::class);
    }

    /**
     * Get the cart associated with the user.
     */
    public function cart()
    {
        return $this->hasOne(Cart::class);
    }

    /**
     * Get the transactions associated with the user.
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get the membership card associated with the user.
     */
    public function membershipCard()
    {
        return $this->hasOne(MembershipCard::class);
    }
}