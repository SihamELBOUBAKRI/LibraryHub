<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('book_to_rent', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->foreignId('author_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->text('description')->nullable();
            $table->year('published_year')->nullable();
            $table->decimal('rental_price', 8, 2);
            $table->string('image')->nullable();
            $table->integer('rental_period_days')->default(7); // Default rental period
            $table->decimal('late_fee_per_day', 8, 2)->default(0.00); // Late return fee
            $table->decimal('damage_fee', 8, 2)->nullable(); // Damage fee if applicable
            $table->integer('total_rentals')->default(0); // Track total rentals
            $table->enum('availability_status', ['available', 'rented', 'reserved'])->default('available'); // Book availability
            $table->enum('condition', ['new', 'good', 'fair', 'damaged'])->default('good'); // Book condition
            $table->integer('min_rental_period_days')->default(1); // Minimum rental duration
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('book_to_rent');
    }
};
