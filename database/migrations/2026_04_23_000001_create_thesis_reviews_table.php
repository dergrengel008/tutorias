<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('thesis_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('tutor_profile_id')->constrained('tutor_profiles')->cascadeOnDelete();

            $table->string('title');
            $table->string('academic_level', 20);
            $table->string('subject_area')->nullable();
            $table->text('instructions')->nullable();

            $table->string('file_path')->nullable();
            $table->string('original_filename')->nullable();

            $table->string('status', 20)->default('pending');

            $table->integer('tokens_cost');
            $table->integer('tutor_earned_tokens');

            $table->tinyInteger('current_round')->default(1);
            $table->tinyInteger('max_rounds')->default(3);

            $table->tinyInteger('final_rating')->nullable();

            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('deadline')->nullable();

            $table->timestamps();

            $table->index(['student_user_id', 'status']);
            $table->index(['tutor_profile_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('thesis_reviews');
    }
};
