<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('book_purchases', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->foreignId('book_id')->constrained('book_to_sell')->onDelete('cascade'); // Reference to the book
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Reference to the user
            $table->integer('quantity')->default(1); // Number of copies purchased
            $table->decimal('price_per_unit', 8, 2); // Price per book
            $table->decimal('total_price', 10, 2); // Total price for the purchase
            $table->date('purchase_date'); // Date of purchase
            $table->string('payment_method'); // Payment method (e.g., credit card, cash)
            $table->enum('payment_status', ['pending', 'completed', 'failed'])->default('pending'); // Payment status
            $table->string('transaction_id')->nullable(); // Unique transaction ID
            $table->timestamps(); // created_at and updated_at
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('book_purchases');
    }
};
