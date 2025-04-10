<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('rentals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained('book_to_rent')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('active_rental_id')->constrained('active_rentals')->onDelete('cascade');
            
            // Rental period dates
            $table->dateTime('rental_date'); // When it was checked out
            $table->dateTime('due_date');    // When it was due
            $table->dateTime('return_date'); // When it was actually returned
            
            // Optional: days late if returned after due date
            $table->integer('days_late')->default(0);
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index('return_date');
            $table->index('book_id');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('rentals');
    }
};