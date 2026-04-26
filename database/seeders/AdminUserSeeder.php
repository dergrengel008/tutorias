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
    }
}
