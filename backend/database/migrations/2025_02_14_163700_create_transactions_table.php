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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            // User who made the payment
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('cascade'); 
            $table->foreignId('membership_card_id')->nullable()->constrained()->onDelete('cascade');
            $table->decimal('amount', 8, 2);
            $table->enum('payment_status', ['Pending', 'Completed', 'Failed'])->default('Pending');
            $table->enum('payment_method', ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery','cash', 'Membership Payment']);
            $table->string('transaction_id')->nullable();
            $table->enum('transaction_type', ['Order', 'Membership'])->default('Order'); 
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
        Schema::dropIfExists('transactions');
    }
};
