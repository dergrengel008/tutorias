<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlatformSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('platform_settings')->insert([
            ['key' => 'commission_rate', 'value' => '0.8', 'type' => 'float', 'group' => 'payment', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'min_withdrawal_tokens', 'value' => '100', 'type' => 'integer', 'group' => 'payment', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'token_price_usd', 'value' => '0.1', 'type' => 'float', 'group' => 'payment', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'platform_name', 'value' => 'TutoriaApp', 'type' => 'string', 'group' => 'branding', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'support_email', 'value' => 'soporte@tutoriaapp.com', 'type' => 'string', 'group' => 'general', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'platform_description', 'value' => 'Plataforma de tutorías en línea', 'type' => 'string', 'group' => 'branding', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'tokens_per_session_default', 'value' => '10', 'type' => 'integer', 'group' => 'payment', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'maintenance_mode', 'value' => '0', 'type' => 'boolean', 'group' => 'general', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
