<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('token_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('tokens');
            $table->integer('bonus_tokens')->default(0);
            $table->decimal('price_usd', 10, 2)->default(0);
            $table->decimal('price_ves', 14, 2)->nullable();
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('token_packages');
    }
};
