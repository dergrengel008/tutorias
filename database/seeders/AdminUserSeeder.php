<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\TutorProfile;
use App\Models\StudentProfile;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@tutoria.com'],
            [
                'name'      => 'Administrador Tutoria',
                'password'  => Hash::make('password'),
                'role'      => 'admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Platform settings
        $settings = [
            ['key' => 'commission_rate', 'value' => '15'],
            ['key' => 'min_session_tokens', 'value' => '5'],
            ['key' => 'token_price_usd', 'value' => '0.50'],
            ['key' => 'platform_name', 'value' => 'TutoriaApp'],
            ['key' => 'tutor_approval_required', 'value' => 'true'],
            ['key' => 'max_students_per_session', 'value' => '5'],
        ];
        foreach ($settings as $setting) {
            \App\Models\PlatformSetting::updateOrCreate(
                ['key' => $setting['key']],
                ['value' => $setting['value']]
            );
        }
    }
}
