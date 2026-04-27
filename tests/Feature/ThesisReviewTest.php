<?php

namespace Tests\Feature;

use App\Models\StudentProfile;
use App\Models\TutorProfile;
use App\Models\User;
use App\Models\ThesisReview;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ThesisReviewTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_thesis_review_model_exists(): void
    {
        $this->assertInstanceOf(ThesisReview::class, new ThesisReview());
    }

    public function test_can_create_thesis_review(): void
    {
        $student = User::factory()->create(['role' => 'student', 'is_active' => true]);
        StudentProfile::create(['user_id' => $student->id, 'education_level' => 'pregrado']);

        $tutor = User::factory()->create(['role' => 'tutor', 'is_active' => true]);
        $tutorProfile = TutorProfile::create([
            'user_id' => $tutor->id,
            'professional_title' => 'Dr.',
            'education_level' => 'Doctorado',
            'years_experience' => 10,
            'hourly_rate' => 100.00,
            'status' => 'approved',
        ]);

        $thesis = ThesisReview::create([
            'student_user_id' => $student->id,
            'tutor_profile_id' => $tutorProfile->id,
            'title' => 'Tesis de Prueba',
            'academic_level' => 'pregrado',
            'status' => 'pending',
            'tokens_cost' => 50,
            'tutor_earned_tokens' => 35,
        ]);

        $this->assertDatabaseHas('thesis_reviews', [
            'title' => 'Tesis de Prueba',
            'tokens_cost' => 50,
        ]);
    }

    public function test_thesis_review_status_flow(): void
    {
        $student = User::factory()->create(['role' => 'student', 'is_active' => true]);
        StudentProfile::create(['user_id' => $student->id, 'education_level' => 'maestria']);

        $tutor = User::factory()->create(['role' => 'tutor', 'is_active' => true]);
        $tutorProfile = TutorProfile::create([
            'user_id' => $tutor->id,
            'professional_title' => 'Mgtr.',
            'education_level' => 'Maestria',
            'hourly_rate' => 80.00,
            'status' => 'approved',
        ]);

        $thesis = ThesisReview::create([
            'student_user_id' => $student->id,
            'tutor_profile_id' => $tutorProfile->id,
            'title' => 'Tesis Flow',
            'academic_level' => 'maestria',
            'status' => 'pending',
            'tokens_cost' => 100,
            'tutor_earned_tokens' => 70,
        ]);

        $this->assertEquals('pending', $thesis->status);

        $thesis->update(['status' => 'in_progress', 'accepted_at' => now()]);
        $this->assertEquals('in_progress', $thesis->fresh()->status);

        $thesis->update(['status' => 'completed', 'completed_at' => now(), 'final_rating' => 5]);
        $this->assertEquals('completed', $thesis->fresh()->status);
    }

    public function test_thesis_tokens_cost_by_level(): void
    {
        $student = User::factory()->create(['role' => 'student', 'is_active' => true]);
        StudentProfile::create(['user_id' => $student->id, 'education_level' => 'doctorado']);

        $tutor = User::factory()->create(['role' => 'tutor', 'is_active' => true]);
        $tutorProfile = TutorProfile::create([
            'user_id' => $tutor->id,
            'professional_title' => 'PhD',
            'education_level' => 'Doctorado',
            'hourly_rate' => 120.00,
            'status' => 'approved',
        ]);

        foreach (['pregrado' => 50, 'maestria' => 100, 'doctorado' => 150] as $level => $cost) {
            $thesis = ThesisReview::create([
                'student_user_id' => $student->id,
                'tutor_profile_id' => $tutorProfile->id,
                'title' => "Tesis {$level}",
                'academic_level' => $level,
                'status' => 'pending',
                'tokens_cost' => $cost,
                'tutor_earned_tokens' => (int)($cost * 0.7),
            ]);
            $this->assertEquals($cost, $thesis->tokens_cost);
        }
    }
}
