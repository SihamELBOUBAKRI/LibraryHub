<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->onDelete('cascade'); // Each item belongs to a cart
            $table->foreignId('book_id')->constrained('book_to_sell')->onDelete('cascade'); // Each item is a book
            $table->integer('quantity')->default(1); // Quantity of the book
            $table->decimal('total_amount', 10, 2)->default(0.00); // Total price for this item
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('cart_items');
    }
};