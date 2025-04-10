<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('active_rentals', function (Blueprint $table) {
            $table->id();
            
            // Required relationships
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('book_id')->nullable()->constrained('book_to_rent')->onDelete('cascade');
            
            // Reservation information (nullable for walk-ins)
            $table->foreignId('reservation_id')->nullable()->constrained('book_reservations')->onDelete('cascade');
            
            // Membership card reference (using regular string column)
            $table->string('membership_card_number')->nullable();
            
            // Payment information (only required for walk-ins)
            $table->enum('payment_method', ['cash', 'credit_card'])->nullable();
            $table->string('card_holder_name')->nullable();
            $table->string('card_last_four')->nullable();
            $table->string('card_expiration')->nullable();
            
            // Status tracking
            $table->enum('status', ['active', 'overdue', 'returned'])->default('active');
            
            // Rental period
            $table->date('rental_date')->default(DB::raw('CURRENT_DATE'));
            $table->date('due_date');
            
            $table->timestamps();
            
            // Indexes
            $table->index('status');
            $table->index('due_date');
        });

        // Add the CHECK constraint using raw SQL
        DB::statement('ALTER TABLE active_rentals ADD CONSTRAINT rental_must_have_book_or_reservation 
                      CHECK (book_id IS NOT NULL OR reservation_id IS NOT NULL)');
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('active_rentals');
    }
};