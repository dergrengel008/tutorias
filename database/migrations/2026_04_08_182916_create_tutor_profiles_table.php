<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tutor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('professional_title')->nullable();
            $table->string('education_level')->nullable();
            $table->integer('years_experience')->default(0);
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->string('id_card_image')->nullable();
            $table->string('title_document')->nullable();
            $table->string('selfie_image')->nullable();
            $table->boolean('is_approved')->default(false);
            $table->timestamp('approval_date')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->decimal('average_rating', 3, 2)->default(0.00);
            $table->integer('total_sessions')->default(0);
            $table->integer('total_warnings')->default(0);
            $table->string('status', 20)->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tutor_profiles');
    }
};
