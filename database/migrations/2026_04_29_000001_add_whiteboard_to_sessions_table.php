<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tutoring_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('tutoring_sessions', 'whiteboard_data')) {
                $table->text('whiteboard_data')->nullable()->after('notes');
            }
            if (!Schema::hasColumn('tutoring_sessions', 'whiteboard_type')) {
                $table->string('whiteboard_type', 50)->default('excalidraw')->after('whiteboard_data');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tutoring_sessions', function (Blueprint $table) {
            $table->dropColumn(['whiteboard_data', 'whiteboard_type']);
        });
    }
};
