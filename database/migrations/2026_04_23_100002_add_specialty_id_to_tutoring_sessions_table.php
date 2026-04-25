<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tutoring_sessions', function (Blueprint $table) {
            $table->bigInteger('specialty_id')->nullable();
            $table->foreign('specialty_id')->references('id')->on('specialties')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('tutoring_sessions', function (Blueprint $table) {
            $table->dropForeign(['specialty_id']);
            $table->dropColumn('specialty_id');
        });
    }
};
