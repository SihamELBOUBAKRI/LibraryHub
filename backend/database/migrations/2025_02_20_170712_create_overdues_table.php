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
        Schema::create('overdues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('active_rental_id')->constrained('active_rentals')->onDelete('cascade');
            $table->foreignId('book_id')->constrained('book_to_rent')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Overdue details
            $table->decimal('penalty_amount', 8, 2);
            $table->integer('days_overdue');
            $table->date('original_due_date');
            
            // Payment status
            $table->boolean('penalty_paid')->default(false);
            $table->date('paid_date')->nullable();
            
            // Return status
            $table->boolean('book_returned')->default(false);
            $table->date('return_date')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('penalty_paid');
            $table->index('days_overdue');
            $table->index('book_returned');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('overdues');
    }
};