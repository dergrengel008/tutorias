<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\StudentProfile;
use App\Models\Specialty;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SessionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_specialties_are_seeded(): void
    {
        $this->assertDatabaseHas('specialties', ['name' => 'Matemáticas']);
        $this->assertDatabaseHas('specialties', ['name' => 'Programación']);
        $this->assertDatabaseHas('specialties', ['name' => 'Inglés']);
        $this->assertCount(15, Specialty::all());
    }

    public function test_tutoring_session_model_exists(): void
    {
        $session = new TutoringSession();
        $this->assertInstanceOf(TutoringSession::class, $session);

        $fillable = $session->getFillable();
        $this->assertContains('title', $fillable);
        $this->assertContains('status', $fillable);
        $this->assertContains('scheduled_at', $fillable);
    }

    public function test_session_scopes_work(): void
    {
        $tutorProfile = TutorProfile::create([
            'user_id' => User::factory()->create(['role' => 'tutor'])->id,
            'professional_title' => 'Profesor',
            'education_level' => 'Doctorado',
            'hourly_rate' => 25.00,
            'status' => 'approved',
        ]);

        $studentUser = User::factory()->create(['role' => 'student']);
        StudentProfile::create([
            'user_id' => $studentUser->id,
            'education_level' => 'Universitario',
        ]);

        $pastSession = TutoringSession::create([
            'tutor_profile_id' => $tutorProfile->id,
            'student_user_id' => $studentUser->id,
            'title' => 'Past Session',
            'description' => 'Completed session',
            'scheduled_at' => now()->subDays(2),
            'started_at' => now()->subDays(2),
            'ended_at' => now()->subDays(2)->addHour(),
            'duration_minutes' => 60,
            'status' => 'completed',
        ]);

        $futureSession = TutoringSession::create([
            'tutor_profile_id' => $tutorProfile->id,
            'student_user_id' => $studentUser->id,
            'title' => 'Future Session',
            'description' => 'Scheduled session',
            'scheduled_at' => now()->addDays(2),
            'duration_minutes' => 60,
            'status' => 'scheduled',
        ]);

        $completed = TutoringSession::completed()->get();
        $this->assertCount(1, $completed);
        $this->assertEquals('Past Session', $completed->first()->title);

        $scheduled = TutoringSession::scheduled()->get();
        $this->assertCount(1, $scheduled);
        $this->assertEquals('Future Session', $scheduled->first()->title);

        $past = TutoringSession::past()->get();
        $this->assertCount(1, $past);

        $upcoming = TutoringSession::upcoming()->get();
        $this->assertCount(1, $upcoming);
    }

    public function test_session_relationships(): void
    {
        $tutorProfile = TutorProfile::create([
            'user_id' => User::factory()->create(['role' => 'tutor'])->id,
            'professional_title' => 'Ingeniero',
            'education_level' => 'Universitario',
            'hourly_rate' => 30.00,
            'status' => 'approved',
        ]);

        $studentUser = User::factory()->create(['role' => 'student']);
        StudentProfile::create([
            'user_id' => $studentUser->id,
            'education_level' => 'Bachillerato',
        ]);

        $session = TutoringSession::create([
            'tutor_profile_id' => $tutorProfile->id,
            'student_user_id' => $studentUser->id,
            'title' => 'Relationship Test',
            'description' => 'Testing relationships',
            'scheduled_at' => now()->addDay(),
            'duration_minutes' => 60,
            'status' => 'scheduled',
        ]);

        $this->assertEquals($tutorProfile->id, $session->tutorProfile->id);
        $this->assertEquals($studentUser->id, $session->student->id);
    }
}
