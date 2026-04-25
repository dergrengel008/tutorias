<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('thesis_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thesis_review_id')->constrained('thesis_reviews')->cascadeOnDelete();
            $table->tinyInteger('round_number');

            $table->text('overall_comments')->nullable();

            $table->tinyInteger('structure_rating')->nullable();
            $table->tinyInteger('content_rating')->nullable();
            $table->tinyInteger('methodology_rating')->nullable();
            $table->tinyInteger('writing_rating')->nullable();
            $table->tinyInteger('references_rating')->nullable();

            $table->json('detailed_feedback')->nullable();

            $table->string('annotated_file_path')->nullable();
            $table->string('annotated_filename')->nullable();

            $table->timestamps();

            $table->unique(['thesis_review_id', 'round_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('thesis_feedback');
    }
};
