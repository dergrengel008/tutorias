<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Index already created in create_session_messages_table migration
    }

    public function down(): void
    {
        // No-op
    }
};
