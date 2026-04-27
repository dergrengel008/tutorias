<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Review;
use App\Models\TutorProfile;
use App\Models\StudentProfile;
use App\Models\Specialty;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_review_model_exists(): void
    {
        $review = new Review();
        $this->assertInstanceOf(Review::class, $review);
    }

    public function test_can_create_review(): void
    {
        $tutorUser = User::factory()->create(['role' => 'tutor']);
        $tutorProfile = TutorProfile::create([
            'user_id' => $tutorUser->id,
            'professional_title' => 'Profesor',
            'education_level' => 'Universitario',
            'hourly_rate' => 40.00,
            'status' => 'approved',
        ]);

        $studentUser = User::factory()->create(['role' => 'student']);
        StudentProfile::create([
            'user_id' => $studentUser->id,
            'education_level' => 'Universitario',
        ]);

        $review = Review::create([
            'tutor_profile_id' => $tutorProfile->id,
            'reviewer_user_id' => $studentUser->id,
            'rating' => 5,
            'comment' => 'Excelente tutor, muy claro y paciente con las explicaciones.',
            'type' => 'review',
        ]);

        $this->assertDatabaseHas('reviews', [
            'tutor_profile_id' => $tutorProfile->id,
            'reviewer_user_id' => $studentUser->id,
            'rating' => 5,
        ]);

        $this->assertEquals(5, $review->rating);
        $this->assertStringContainsString('Excelente', $review->comment);
    }

    public function test_average_rating_calculation(): void
    {
        $tutorUser = User::factory()->create(['role' => 'tutor']);
        $tutorProfile = TutorProfile::create([
            'user_id' => $tutorUser->id,
            'professional_title' => 'Docente',
            'education_level' => 'Maestria',
            'hourly_rate' => 35.00,
            'status' => 'approved',
        ]);

        // Create multiple reviews
        foreach ([4, 5, 3, 5, 4] as $rating) {
            $student = User::factory()->create(['role' => 'student']);
            StudentProfile::create([
                'user_id' => $student->id,
                'education_level' => 'Universitario',
            ]);

            Review::create([
                'tutor_profile_id' => $tutorProfile->id,
                'reviewer_user_id' => $student->id,
                'rating' => $rating,
                'comment' => "Rating: {$rating}",
                'type' => 'review',
            ]);
        }

        $average = $tutorProfile->reviews()->avg('rating');
        $this->assertEqualsWithDelta(4.2, $average, 0.01);
    }
}
