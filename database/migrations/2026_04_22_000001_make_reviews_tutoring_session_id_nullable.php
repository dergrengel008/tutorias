<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->foreignId('tutoring_session_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        \App\Models\Review::where('type', 'warning')
            ->whereNull('tutoring_session_id')
            ->delete();

        Schema::table('reviews', function (Blueprint $table) {
            $table->foreignId('tutoring_session_id')->nullable(false)->change();
        });
    }
};
