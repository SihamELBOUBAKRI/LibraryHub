<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('book_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('membership_card_id')->constrained('membership_cards')->onDelete('cascade');
            $table->foreignId('book_id')->constrained('book_to_rent')->onDelete('cascade');
            $table->string('reservation_code')->unique();
            $table->enum('payment_method', ['cash', 'credit_card']);
            $table->string('card_holder_name')->nullable();
            $table->string('card_last_four', 4)->nullable();
            $table->string('card_expiration', 5)->nullable();
            $table->enum('status', ['waiting', 'picked', 'expired', 'cancelled'])->default('waiting');
            $table->text('staff_notes')->nullable();
            $table->dateTime('pickup_deadline');
            $table->dateTime('picked_up_at')->nullable();
            $table->timestamps();
            
            $table->index('reservation_code');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_reservations');
    }
};