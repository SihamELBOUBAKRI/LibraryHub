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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // User who placed the order
            $table->foreignId('cart_id')->constrained()->onDelete('cascade'); // Reference to the cart where the books are
            $table->decimal('total_price', 8, 2); // Total price for the order (sum of cart book prices)
            $table->enum('status', ['Pending', 'Paid', 'Shipped', 'Cancelled'])->default('Pending'); // Order status
            $table->enum('payment_method', ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery']); // Payment method
            $table->string('shipping_address'); // Address where the order will be shipped
            $table->text('notes')->nullable(); // Any additional notes from the user
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
        Schema::dropIfExists('orders');
    }
};
