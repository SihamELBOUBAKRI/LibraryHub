<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('wishlist_book', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wishlist_id')->constrained()->onDelete('cascade'); // Reference to wishlist
            $table->foreignId('book_id')->constrained('book_to_sell')->onDelete('cascade'); // Reference to book
            $table->timestamps(); // Optional: To track when the book was added to the wishlist
        });
    }

    public function down()
    {
        Schema::dropIfExists('wishlist_book');
    }
};