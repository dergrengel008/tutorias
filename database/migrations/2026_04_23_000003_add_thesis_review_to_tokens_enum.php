<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // transaction_type ya es string, soporta 'thesis_review' sin cambios
    }

    public function down(): void
    {
        // No-op: string accepts all values
    }
};
