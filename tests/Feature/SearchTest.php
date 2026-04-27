<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Specialty;
use App\Models\TutorProfile;
use App\Models\StudentProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_specialties_exist_for_search(): void
    {
        $specialties = Specialty::all();

        $this->assertGreaterThanOrEqual(15, $specialties->count());

        $names = $specialties->pluck('name')->toArray();
        $this->assertContains('Matemáticas', $names);
        $this->assertContains('Programación', $names);
        $this->assertContains('Inglés', $names);
    }

    public function test_tutor_search_by_specialty(): void
    {
        $mathSpecialty = Specialty::where('name', 'Matemáticas')->first();

        $tutorUser = User::factory()->create([
            'role' => 'tutor',
            'name' => 'Carlos Matemático',
            'is_active' => true,
        ]);

        $tutorProfile = TutorProfile::create([
            'user_id' => $tutorUser->id,
            'professional_title' => 'Profesor de Matemáticas',
            'education_level' => 'Maestria',
            'hourly_rate' => 25.00,
            'status' => 'approved',
        ]);

        $tutorProfile->specialties()->attach($mathSpecialty->id);

        $approvedTutors = TutorProfile::where('status', 'approved')->get();
        $this->assertGreaterThanOrEqual(1, $approvedTutors->count());

        $mathTutors = TutorProfile::where('status', 'approved')
            ->whereHas('specialties', fn($q) => $q->where('name', 'Matemáticas'))
            ->get();

        $this->assertGreaterThanOrEqual(1, $mathTutors->count());
    }

    public function test_inactive_tutors_not_in_results(): void
    {
        $inactiveTutor = User::factory()->create([
            'role' => 'tutor',
            'is_active' => false,
        ]);

        TutorProfile::create([
            'user_id' => $inactiveTutor->id,
            'professional_title' => 'Tutor',
            'education_level' => 'Universitario',
            'hourly_rate' => 15.00,
            'status' => 'approved',
        ]);

        $activeTutors = User::tutors()->active()->get();
        $found = $activeTutors->contains('id', $inactiveTutor->id);
        $this->assertFalse($found);
    }
}
