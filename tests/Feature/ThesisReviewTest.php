<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\TutorProfile;
use App\Models\StudentProfile;
use App\Models\ThesisReview;
use App\Models\Token;
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
        $this->assertTrue(class_exists(\App\Models\ThesisReview::class));
    }

    public function test_can_create_thesis_review(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        StudentProfile::create([
            'user_id' => $student->id,
            'education_level' => 'Universitario',
        ]);

        $tutorUser = User::factory()->create(['role' => 'tutor']);
        $tutorProfile = TutorProfile::factory()->approved()->create(['user_id' => $tutorUser->id]);

        $thesisReview = ThesisReview::create([
            'student_user_id' => $student->id,
            'tutor_profile_id' => $tutorProfile->id,
            'title' => 'Tesis de Prueba',
            'academic_level' => 'pregrado',
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('thesis_reviews', [
            'id' => $thesisReview->id,
            'title' => 'Tesis de Prueba',
            'academic_level' => 'pregrado',
            'status' => 'pending',
        ]);
    }

    public function test_thesis_review_status_flow(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        StudentProfile::create([
            'user_id' => $student->id,
            'education_level' => 'Universitario',
        ]);

        $tutorUser = User::factory()->create(['role' => 'tutor']);
        $tutorProfile = TutorProfile::factory()->approved()->create(['user_id' => $tutorUser->id]);

        $thesisReview = ThesisReview::create([
            'student_user_id' => $student->id,
            'tutor_profile_id' => $tutorProfile->id,
            'title' => 'Tesis Flow',
            'academic_level' => 'pregrado',
            'status' => 'pending',
        ]);

        $this->assertEquals('pending', $thesisReview->status);

        $thesisReview->update(['status' => 'in_review']);
        $this->assertEquals('in_review', $thesisReview->status);

        $thesisReview->update(['status' => 'completed']);
        $this->assertEquals('completed', $thesisReview->status);
    }

    public function test_thesis_tokens_cost_by_level(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        StudentProfile::create([
            'user_id' => $student->id,
            'education_level' => 'Universitario',
        ]);

        $tutorUser = User::factory()->create(['role' => 'tutor']);
        $tutorProfile = TutorProfile::factory()->approved()->create(['user_id' => $tutorUser->id]);

        $thesisReview = ThesisReview::create([
            'student_user_id' => $student->id,
            'tutor_profile_id' => $tutorProfile->id,
            'title' => 'Tesis pregrado',
            'academic_level' => 'pregrado',
            'status' => 'pending',
        ]);

        $this->assertNotNull($thesisReview->tokens_cost);
    }
}