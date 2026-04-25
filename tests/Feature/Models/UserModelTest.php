<?php

namespace Tests\Feature\Models;

use App\Models\Review;
use App\Models\StudentProfile;
use App\Models\Token;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    protected function createUser(array $overrides = []): User
    {
        return User::create(array_merge([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'role' => 'student',
            'is_active' => true,
            'email_verified_at' => now(),
        ], $overrides));
    }

    public function test_user_has_tutor_profile_relationship(): void
    {
        $user = $this->createUser(['role' => 'tutor']);

        TutorProfile::create([
            'user_id' => $user->id,
            'status' => 'pending',
            'is_approved' => false,
            'average_rating' => 0.00,
            'total_sessions' => 0,
            'total_warnings' => 0,
        ]);

        $this->assertInstanceOf(TutorProfile::class, $user->tutorProfile);
        $this->assertEquals($user->id, $user->tutorProfile->user_id);
    }

    public function test_user_has_student_profile_relationship(): void
    {
        $user = $this->createUser(['role' => 'student']);

        StudentProfile::create([
            'user_id' => $user->id,
            'total_sessions_completed' => 0,
        ]);

        $this->assertInstanceOf(StudentProfile::class, $user->studentProfile);
        $this->assertEquals($user->id, $user->studentProfile->user_id);
    }

    public function test_user_has_tokens_relationship(): void
    {
        $user = $this->createUser();

        Token::create([
            'user_id' => $user->id,
            'quantity' => 10,
            'transaction_type' => 'purchase',
            'amount' => 50.00,
            'tokens_before' => 0,
            'tokens_after' => 10,
            'description' => 'Token purchase',
        ]);

        Token::create([
            'user_id' => $user->id,
            'quantity' => -1,
            'transaction_type' => 'session_payment',
            'amount' => null,
            'tokens_before' => 10,
            'tokens_after' => 9,
            'description' => 'Session payment',
        ]);

        $this->assertCount(2, $user->tokens);
        $this->assertInstanceOf(Token::class, $user->tokens->first());
    }

    public function test_user_has_reviews_relationship(): void
    {
        $tutorUser = $this->createUser([
            'role' => 'tutor',
            'email' => 'tutor@example.com',
        ]);

        $tutorProfile = TutorProfile::create([
            'user_id' => $tutorUser->id,
            'status' => 'approved',
            'is_approved' => true,
            'average_rating' => 0.00,
            'total_sessions' => 0,
            'total_warnings' => 0,
        ]);

        $studentUser = $this->createUser([
            'role' => 'student',
            'email' => 'student@example.com',
        ]);

        $session = TutoringSession::create([
            'tutor_profile_id' => $tutorProfile->id,
            'student_user_id' => $studentUser->id,
            'title' => 'Test Session',
            'status' => 'completed',
            'scheduled_at' => now()->subHours(2),
            'started_at' => now()->subHours(2),
            'ended_at' => now()->subHour(),
            'duration_minutes' => 60,
        ]);

        Review::create([
            'tutoring_session_id' => $session->id,
            'reviewer_user_id' => $studentUser->id,
            'tutor_profile_id' => $tutorProfile->id,
            'rating' => 5,
            'comment' => 'Great tutor!',
            'type' => 'review',
        ]);

        // reviewsGiven relationship returns reviews where the user is the reviewer
        $this->assertCount(1, $studentUser->reviewsGiven);
        $this->assertInstanceOf(Review::class, $studentUser->reviewsGiven->first());
        $this->assertEquals(5, $studentUser->reviewsGiven->first()->rating);
    }
}
