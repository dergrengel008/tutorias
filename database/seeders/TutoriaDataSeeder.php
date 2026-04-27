<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\TutorProfile;
use App\Models\StudentProfile;
use App\Models\Specialty;

class TutoriaDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create a sample tutor
        $tutor = User::firstOrCreate(
            ['email' => 'tutor@tutoria.com'],
            [
                'name' => 'Maria Tutor Profesional',
                'password' => bcrypt('password'),
                'role' => 'tutor',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        TutorProfile::firstOrCreate(
            ['user_id' => $tutor->id],
            [
                'professional_title' => 'Profesora Universitaria',
                'education_level' => 'Maestria',
                'years_experience' => 8,
                'hourly_rate' => 25.00,
                'is_approved' => true,
                'status' => 'approved',
                'approval_date' => now(),
            ]
        );

        // Create a sample student
        $student = User::firstOrCreate(
            ['email' => 'student@tutoria.com'],
            [
                'name' => 'Carlos Estudiante',
                'password' => bcrypt('password'),
                'role' => 'student',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        StudentProfile::firstOrCreate(
            ['user_id' => $student->id],
            [
                'education_level' => 'Universitario',
                'institution' => 'Universidad Central de Venezuela',
            ]
        );

        // Attach specialties to tutor
        $math = Specialty::where('name', 'Matemáticas')->first();
        $physics = Specialty::where('name', 'Física')->first();

        if ($math && $tutor->tutorProfile) {
            $tutor->tutorProfile->specialties()->syncWithoutDetaching([$math->id]);
        }
        if ($physics && $tutor->tutorProfile) {
            $tutor->tutorProfile->specialties()->syncWithoutDetaching([$physics->id]);
        }
    }
}
