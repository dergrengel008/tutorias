<?php

namespace Tests\Feature\Models;

use App\Models\Specialty;
use App\Models\StudentProfile;
use App\Models\Token;
use App\Models\TutorProfile;
use App\Models\TutoringSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TutoringSessionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->specialty = Specialty::create([
            'name' => 'Matematicas',
            'description' => 'Matematicas',
            'icon' => 'calculator',
            'tokens_cost' => 10,
        ]);
    }

    public function test_session_belongs_to_tutor_profile(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor']);
        $tutorProfile = $tutor->tutorProfile()->create([
            'title' => 'Prof',
            'education' => 'UCV',
            'experience' => '5',
            'rate' => 50,
            'status' => 'approved',
        ]);

        $student = User::factory()->create(['role' => 'student']);
        $studentProfile = $student->studentProfile()->create(['education_level' => 'Universitario']);

        $session = TutoringSession::create([
            'tutor_profile_id' => $tutorProfile->id,
            'student_user_id' => $student->id,
            'specialty_id' => $this->specialty->id,
            'title' => 'Clase de Matematicas',
            'description' => 'Algebra lineal',
            'scheduled_at' => now()->addDays(1),
            'tokens_cost' => 10,
            'status' => 'scheduled',
        ]);

        $this->assertEquals($tutorProfile->id, $session->tutorProfile->id);
    }

    public function test_session_belongs_to_student(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor']);
        $tutorProfile = $tutor->tutorProfile()->create([
            'title' => 'Prof',
            'education' => 'UCV',
            'experience' => '5',
            'rate' => 50,
            'status' => 'approved',
        ]);

        $student = User::factory()->create(['role' => 'student']);
        $student->studentProfile()->create(['education_level' => 'Universitario']);

        $session = TutoringSession::create([
            'tutor_profile_id' => $tutorProfile->id,
            'student_user_id' => $student->id,
            'specialty_id' => $this->specialty->id,
            'title' => 'Clase',
            'scheduled_at' => now()->addDays(1),
            'tokens_cost' => 10,
            'status' => 'scheduled',
        ]);

        $this->assertEquals($student->id, $session->student->id);
    }

    public function test_scheduled_scope(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor']);
        $tutorProfile = $tutor->tutorProfile()->create(['status' => 'approved', 'education' => 'UCV', 'experience' => '5', 'rate' => 50, 'title' => 'Prof']);
        $student = User::factory()->create(['role' => 'student']);
        $student->studentProfile()->create(['education_level' => 'U']);

        TutoringSession::create([
            'tutor_profile_id' => $tutorProfile->id, 'student_user_id' => $student->id,
            'specialty_id' => $this->specialty->id, 'title' => 'S1',
            'scheduled_at' => now()->addDays(1), 'tokens_cost' => 10, 'status' => 'scheduled',
        ]);
        TutoringSession::create([
            'tutor_profile_id' => $tutorProfile->id, 'student_user_id' => $student->id,
            'specialty_id' => $this->specialty->id, 'title' => 'S2',
            'scheduled_at' => now()->addDays(2), 'tokens_cost' => 10, 'status' => 'completed',
        ]);
        TutoringSession::create([
            'tutor_profile_id' => $tutorProfile->id, 'student_user_id' => $student->id,
            'specialty_id' => $this->specialty->id, 'title' => 'S3',
            'scheduled_at' => now()->addDays(3), 'tokens_cost' => 10, 'status' => 'in_progress',
        ]);

        $this->assertEquals(1, TutoringSession::scheduled()->count());
    }

    public function test_upcoming_scope(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor']);
        $tutorProfile = $tutor->tutorProfile()->create(['status' => 'approved', 'education' => 'UCV', 'experience' => '5', 'rate' => 50, 'title' => 'Prof']);
        $student = User::factory()->create(['role' => 'student']);
        $student->studentProfile()->create(['education_level' => 'U']);

        TutoringSession::create([
            'tutor_profile_id' => $tutorProfile->id, 'student_user_id' => $student->id,
            'specialty_id' => $this->specialty->id, 'title' => 'Future',
            'scheduled_at' => now()->addDays(1), 'tokens_cost' => 10, 'status' => 'scheduled',
        ]);
        TutoringSession::create([
            'tutor_profile_id' => $tutorProfile->id, 'student_user_id' => $student->id,
            'specialty_id' => $this->specialty->id, 'title' => 'Past',
            'scheduled_at' => now()->subDays(1), 'tokens_cost' => 10, 'status' => 'completed',
        ]);

        $this->assertEquals(1, TutoringSession::upcoming()->count());
    }

    public function test_completed_scope(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor']);
        $tutorProfile = $tutor->tutorProfile()->create(['status' => 'approved', 'education' => 'UCV', 'experience' => '5', 'rate' => 50, 'title' => 'Prof']);
        $student = User::factory()->create(['role' => 'student']);
        $student->studentProfile()->create(['education_level' => 'U']);

        TutoringSession::create([
            'tutor_profile_id' => $tutorProfile->id, 'student_user_id' => $student->id,
            'specialty_id' => $this->specialty->id, 'title' => 'Done',
            'scheduled_at' => now()->subDays(1), 'tokens_cost' => 10, 'status' => 'completed',
        ]);
        TutoringSession::create([
            'tutor_profile_id' => $tutorProfile->id, 'student_user_id' => $student->id,
            'specialty_id' => $this->specialty->id, 'title' => 'Active',
            'scheduled_at' => now(), 'tokens_cost' => 10, 'status' => 'in_progress',
        ]);

        $this->assertEquals(1, TutoringSession::completed()->count());
    }

    public function test_whiteboard_data_is_cast_to_array(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor']);
        $tutorProfile = $tutor->tutorProfile()->create(['status' => 'approved', 'education' => 'UCV', 'experience' => '5', 'rate' => 50, 'title' => 'Prof']);
        $student = User::factory()->create(['role' => 'student']);
        $student->studentProfile()->create(['education_level' => 'U']);

        $session = TutoringSession::create([
            'tutor_profile_id' => $tutorProfile->id, 'student_user_id' => $student->id,
            'specialty_id' => $this->specialty->id, 'title' => 'WB',
            'scheduled_at' => now(), 'tokens_cost' => 10, 'status' => 'in_progress',
            'whiteboard_data' => '{"shapes":[],"version":1}',
        ]);

        $this->assertIsArray($session->fresh()->whiteboard_data);
        $this->assertEquals(['shapes' => [], 'version' => 1], $session->whiteboard_data);
    }
}
