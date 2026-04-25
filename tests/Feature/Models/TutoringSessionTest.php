<?php

namespace Tests\Feature\Models;

use App\Models\Review;
use App\Models\SessionMessage;
use App\Models\StudentProfile;
use App\Models\Token;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TutoringSessionTest extends TestCase
{
    use RefreshDatabase;

    protected function createTutorWithProfile(): array
    {
        $user = User::create([
            'name' => 'Tutor User',
            'email' => 'tutor@example.com',
            'password' => Hash::make('password'),
            'role' => 'tutor',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $tutorProfile = TutorProfile::create([
            'user_id' => $user->id,
            'status' => 'approved',
            'is_approved' => true,
            'average_rating' => 0.00,
            'total_sessions' => 0,
            'total_warnings' => 0,
        ]);

        return ['user' => $user, 'tutorProfile' => $tutorProfile];
    }

    protected function createStudentUser(): User
    {
        return User::create([
            'name' => 'Student User',
            'email' => 'student@example.com',
            'password' => Hash::make('password'),
            'role' => 'student',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
    }

    protected function createSession(TutorProfile $tutorProfile, User $student, array $overrides = []): TutoringSession
    {
        return TutoringSession::create(array_merge([
            'tutor_profile_id' => $tutorProfile->id,
            'student_user_id' => $student->id,
            'title' => 'Mathematics Tutoring',
            'description' => 'Algebra and calculus review',
            'status' => 'scheduled',
            'scheduled_at' => now()->addDay(),
            'duration_minutes' => 60,
        ], $overrides));
    }

    public function test_session_belongs_to_tutor_profile(): void
    {
        ['tutorProfile' => $tutorProfile] = $this->createTutorWithProfile();
        $student = $this->createStudentUser();
        $session = $this->createSession($tutorProfile, $student);

        $this->assertInstanceOf(TutorProfile::class, $session->tutorProfile);
        $this->assertEquals($tutorProfile->id, $session->tutorProfile->id);
        $this->assertEquals($tutorProfile->user_id, $session->tutorProfile->user_id);
    }

    public function test_session_belongs_to_student(): void
    {
        ['tutorProfile' => $tutorProfile] = $this->createTutorWithProfile();
        $student = $this->createStudentUser();
        $session = $this->createSession($tutorProfile, $student);

        $this->assertInstanceOf(User::class, $session->student);
        $this->assertEquals($student->id, $session->student->id);
        $this->assertEquals('student', $session->student->role);
    }

    public function test_session_has_reviews(): void
    {
        ['tutorProfile' => $tutorProfile] = $this->createTutorWithProfile();
        $student = $this->createStudentUser();
        $session = $this->createSession($tutorProfile, $student, [
            'status' => 'completed',
            'started_at' => now()->subHours(2),
            'ended_at' => now()->subHour(),
        ]);

        Review::create([
            'tutoring_session_id' => $session->id,
            'reviewer_user_id' => $student->id,
            'tutor_profile_id' => $tutorProfile->id,
            'rating' => 4,
            'comment' => 'Very helpful session',
            'type' => 'review',
        ]);

        Review::create([
            'tutoring_session_id' => $session->id,
            'reviewer_user_id' => $student->id,
            'tutor_profile_id' => $tutorProfile->id,
            'rating' => 5,
            'comment' => 'Excellent explanations',
            'type' => 'review',
        ]);

        $this->assertCount(2, $session->reviews);
        $this->assertInstanceOf(Review::class, $session->reviews->first());
    }

    public function test_session_has_messages(): void
    {
        ['tutorProfile' => $tutorProfile, 'user' => $tutorUser] = $this->createTutorWithProfile();
        $student = $this->createStudentUser();
        $session = $this->createSession($tutorProfile, $student);

        SessionMessage::create([
            'tutoring_session_id' => $session->id,
            'user_id' => $student->id,
            'message' => 'Hello, can you help me with derivatives?',
        ]);

        SessionMessage::create([
            'tutoring_session_id' => $session->id,
            'user_id' => $tutorUser->id,
            'message' => 'Of course! Let me explain step by step.',
        ]);

        $this->assertCount(2, $session->messages);
        $this->assertInstanceOf(SessionMessage::class, $session->messages->first());
        $this->assertEquals('Hello, can you help me with derivatives?', $session->messages->first()->message);
    }
}
