<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('membership_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->string('card_number')->unique();
            $table->date('issued_on');
            $table->date('valid_until');
            $table->enum('membership_type', ['monthly', 'yearly']);
            $table->decimal('amount_paid', 8, 2);
            $table->string('currency')->default('USD'); // Currency of payment
            $table->string('payment_method'); 
            $table->string('transaction_id')->nullable(); 
            $table->enum('payment_status', ['pending', 'completed', 'failed'])->default('pending');
            $table->string('card_holder_name')->nullable();
            $table->string('card_last_four')->nullable();
            $table->string('expiration_date')->nullable();
            $table->string('billing_address')->nullable();

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('membership_cards');
    }
};

