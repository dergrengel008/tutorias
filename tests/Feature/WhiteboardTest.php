<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\TutorProfile;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\Specialty;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WhiteboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    protected function createSession(): TutoringSession
    {
        $tutorUser = User::factory()->create(['role' => 'tutor']);
        $tutorProfile = TutorProfile::factory()->approved()->create(['user_id' => $tutorUser->id]);
        $tutorProfile->specialties()->attach(Specialty::first()->id);

        $studentUser = User::factory()->create(['role' => 'student']);
        StudentProfile::create([
            'user_id' => $studentUser->id,
            'education_level' => 'Universitario',
        ]);

        return TutoringSession::create([
            'tutor_profile_id' => $tutorProfile->id,
            'student_user_id' => $studentUser->id,
            'title' => 'Sesión de prueba',
            'scheduled_at' => now()->addDay(),
            'status' => 'scheduled',
            'tokens_cost' => 5,
        ]);
    }

    public function test_tutor_can_get_whiteboard(): void
    {
        $session = $this->createSession();
        $tutor = $session->tutorProfile->user;

        $response = $this->actingAs($tutor)
            ->getJson("/api/sessions/{$session->id}/whiteboard");

        $response->assertStatus(200);
        $response->assertJsonStructure(['data', 'specialty', 'type']);
    }

    public function test_student_can_get_whiteboard(): void
    {
        $session = $this->createSession();
        $student = $session->student;

        $response = $this->actingAs($student)
            ->getJson("/api/sessions/{$session->id}/whiteboard");

        $response->assertStatus(200);
    }

    public function test_non_participant_cannot_access_whiteboard(): void
    {
        $session = $this->createSession();
        $outsider = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($outsider)
            ->getJson("/api/sessions/{$session->id}/whiteboard");

        $response->assertStatus(403);
    }

    public function test_guest_cannot_access_whiteboard(): void
    {
        $session = $this->createSession();

        $response = $this->getJson("/api/sessions/{$session->id}/whiteboard");
        $response->assertStatus(401);
    }

    public function test_tutor_can_save_whiteboard(): void
    {
        $session = $this->createSession();
        $tutor = $session->tutorProfile->user;

        $response = $this->actingAs($tutor)
            ->putJson("/api/sessions/{$session->id}/whiteboard", [
                'data' => json_encode(['elements' => [], 'appState' => []]),
                'specialty' => 'Programación',
            ]);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Pizarra guardada exitosamente.']);
    }

    public function test_math_specialty_uses_math_whiteboard_type(): void
    {
        $session = $this->createSession();
        $tutor = $session->tutorProfile->user;

        $response = $this->actingAs($tutor)
            ->putJson("/api/sessions/{$session->id}/whiteboard", [
                'data' => '{"shapes": []}',
                'specialty' => 'Matemáticas',
            ]);

        $response->assertStatus(200);

        // Verify the type was set correctly
        $this->assertDatabaseHas('tutoring_sessions', [
            'id' => $session->id,
            'whiteboard_type' => 'math_latex',
        ]);
    }

    public function test_non_math_specialty_uses_excalidraw(): void
    {
        $session = $this->createSession();
        $tutor = $session->tutorProfile->user;

        $response = $this->actingAs($tutor)
            ->putJson("/api/sessions/{$session->id}/whiteboard", [
                'data' => '{"elements": []}',
                'specialty' => 'Física',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('tutoring_sessions', [
            'id' => $session->id,
            'whiteboard_type' => 'excalidraw',
        ]);
    }
}
