<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // password_reset_tokens already created in 0001_01_01_000000_create_users_table.php
    }

    public function down(): void
    {
        // No-op
    }
};
