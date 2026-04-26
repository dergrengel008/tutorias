<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PlatformSetting;

class PlatformSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'commission_rate', 'value' => '0.8', 'type' => 'float', 'group' => 'payment'],
            ['key' => 'min_withdrawal_tokens', 'value' => '100', 'type' => 'integer', 'group' => 'payment'],
            ['key' => 'token_price_usd', 'value' => '0.1', 'type' => 'float', 'group' => 'payment'],
            ['key' => 'platform_name', 'value' => 'TutoriaApp', 'type' => 'string', 'group' => 'branding'],
            ['key' => 'support_email', 'value' => 'soporte@tutoriaapp.com', 'type' => 'string', 'group' => 'general'],
            ['key' => 'platform_description', 'value' => 'Plataforma de tutorías en línea', 'type' => 'string', 'group' => 'branding'],
            ['key' => 'tokens_per_session_default', 'value' => '10', 'type' => 'integer', 'group' => 'payment'],
            ['key' => 'maintenance_mode', 'value' => '0', 'type' => 'boolean', 'group' => 'general'],
        ];

        foreach ($settings as $setting) {
            PlatformSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
