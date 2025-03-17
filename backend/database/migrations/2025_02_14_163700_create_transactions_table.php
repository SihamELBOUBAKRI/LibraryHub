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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // User who made the payment
            $table->foreignId('order_id')->constrained()->onDelete('cascade'); // Reference to the order being paid
            $table->decimal('amount', 8, 2); // Payment amount
            $table->enum('payment_status', ['Pending', 'Completed', 'Failed'])->default('Pending'); // Payment status
            $table->enum('payment_method', ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery']); // Payment method
            $table->string('transaction_id')->nullable(); // Payment transaction ID from payment gateway (nullable for offline payments)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('transactions');
    }
};
