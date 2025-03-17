<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade'); // Each user has only one wishlist
            $table->timestamps(); // To track when the wishlist was created
        });
    }

    public function down()
    {
        Schema::dropIfExists('wishlists');
    }
};