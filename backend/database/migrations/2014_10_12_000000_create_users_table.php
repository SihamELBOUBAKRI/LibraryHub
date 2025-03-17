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
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->string('password');
                $table->enum('role', ['admin', 'customer'])->default('customer');
                $table->string('address')->nullable(); 
                $table->string('tele')->nullable(); 
                $table->string('cin')->unique(); 
                $table->date('birthyear')->nullable();
                $table->boolean('isamember')->default(false);
                $table->timestamps();
            });
        }
    
        public function down()
        {
            Schema::dropIfExists('users');
        }
    };
