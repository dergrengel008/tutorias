<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\StudentProfile;
use App\Models\TutorProfile;
use App\Models\Token;
use App\Models\Specialty;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SessionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Create specialty for tutors
        $this->specialty = Specialty::create(['name' => 'Mathematics', 'description' => 'Math tutoring']);
    }

    private function createStudent(): User
    {
        $student = User::factory()->create(['role' => 'student', 'is_active' => true]);
        StudentProfile::create(['user_id' => $student->id]);
        // Give student tokens
        Token::create([
            'user_id' => $student->id,
            'quantity' => 100,
            'transaction_type' => 'purchase',
            'amount' => 10.00,
            'tokens_before' => 0,
            'tokens_after' => 100,
            'description' => 'Initial tokens',
        ]);
        return $student;
    }

    private function createApprovedTutor(): User
    {
        $tutor = User::factory()->create(['role' => 'tutor', 'is_active' => true]);
        TutorProfile::create([
            'user_id' => $tutor->id,
            'status' => 'approved',
            'is_approved' => true,
            'hourly_rate' => 10,
            'professional_title' => 'Math Teacher',
            'education_level' => 'bachelor',
            'years_experience' => 5,
        ]);
        $tutor->tutorProfile->specialties()->attach($this->specialty);
        return $tutor;
    }

    public function test_student_can_book_session(): void
    {
        $student = $this->createStudent();
        $tutor = $this->createApprovedTutor();

        $response = $this->actingAs($student)->post('/student/sessions/book', [
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'title' => 'Math Lesson',
            'description' => 'Algebra basics',
            'scheduled_at' => now()->addDays(1)->format('Y-m-d H:i:s'),
            'duration_minutes' => 60,
            'tokens_cost' => 10,
        ]);

        $this->assertDatabaseHas('tutoring_sessions', [
            'student_user_id' => $student->id,
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'title' => 'Math Lesson',
            'status' => 'scheduled',
        ]);
    }

    public function test_student_cannot_book_without_enough_tokens(): void
    {
        $student = $this->createStudent();
        $tutor = $this->createApprovedTutor();

        // Update student balance to 0
        Token::where('user_id', $student->id)->delete();

        $response = $this->actingAs($student)->post('/student/sessions/book', [
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'title' => 'Math Lesson',
            'scheduled_at' => now()->addDays(1)->format('Y-m-d H:i:s'),
            'duration_minutes' => 60,
            'tokens_cost' => 10,
        ]);

        // Should fail or redirect with error
        $this->assertDatabaseMissing('tutoring_sessions', [
            'student_user_id' => $student->id,
            'title' => 'Math Lesson',
        ]);
    }

    public function test_student_can_cancel_session(): void
    {
        $student = $this->createStudent();
        $tutor = $this->createApprovedTutor();

        // Book a session first
        $this->actingAs($student)->post('/student/sessions/book', [
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'title' => 'Math Lesson',
            'scheduled_at' => now()->addDays(1)->format('Y-m-d H:i:s'),
            'duration_minutes' => 60,
            'tokens_cost' => 10,
        ]);

        $sessionId = \App\Models\TutoringSession::first()->id;

        $this->actingAs($student)->post("/sessions/{$sessionId}/cancel");

        $this->assertDatabaseHas('tutoring_sessions', [
            'id' => $sessionId,
            'status' => 'cancelled',
        ]);
    }

    public function test_tutor_can_start_session(): void
    {
        $student = $this->createStudent();
        $tutor = $this->createApprovedTutor();

        $this->actingAs($student)->post('/student/sessions/book', [
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'title' => 'Math Lesson',
            'scheduled_at' => now()->addDays(1)->format('Y-m-d H:i:s'),
            'duration_minutes' => 60,
            'tokens_cost' => 10,
        ]);

        $sessionId = \App\Models\TutoringSession::first()->id;

        $this->actingAs($tutor)->post("/sessions/{$sessionId}/start");

        $this->assertDatabaseHas('tutoring_sessions', [
            'id' => $sessionId,
            'status' => 'in_progress',
        ]);
    }
}
