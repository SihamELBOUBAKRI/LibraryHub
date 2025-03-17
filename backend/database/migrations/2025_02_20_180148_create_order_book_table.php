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
    Schema::create('order_book', function (Blueprint $table) {
        $table->id();
        $table->foreignId('order_id')->constrained()->onDelete('cascade'); // Reference to order
        $table->foreignId('book_id')->constrained('book_to_sell')->onDelete('cascade'); // Reference to book
        $table->integer('quantity')->default(1); // Quantity of the book in the order
        $table->timestamps(); // Optional: To track when the book was added to the order
    });
}

public function down()
{
    Schema::dropIfExists('order_book');
}
};
