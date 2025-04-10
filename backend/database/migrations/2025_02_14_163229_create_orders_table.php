<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('book_id')->constrained('book_to_sell'); // Now required
            $table->integer('quantity')->default(1);
            $table->decimal('book_price', 8, 2);
            $table->decimal('total_price', 10, 2);
            $table->enum('status', ['Pending', 'Paid', 'Shipped', 'Cancelled'])->default('Pending');
            $table->enum('payment_method', ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery']);
            $table->string('shipping_address');
            $table->text('notes')->nullable();
            $table->string('transaction_id')->nullable();
            $table->enum('payment_status', ['Pending', 'Completed', 'Failed', 'Refunded'])->default('Pending');
            $table->string('shipping_tracking_number')->nullable();
            $table->date('expected_delivery_date')->nullable();
            $table->string('card_holder_name')->nullable();
            $table->string('card_last_four', 4)->nullable();
            $table->string('expiration_date', 7)->nullable();
            $table->timestamps();
            
            // Removed cart_id completely
        });
    }

    public function down()
    {
        Schema::dropIfExists('orders');
    }
};