<?php

namespace Tests\Feature;

use App\Models\StudentProfile;
use App\Models\Token;
use App\Models\TutorProfile;
use App\Models\User;
use App\Models\ThesisReview;
use App\Models\Specialty;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ThesisReviewTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        $this->specialty = Specialty::create([
            'name' => 'Ingenieria',
            'description' => 'Ingenieria de Sistemas',
            'icon' => 'code',
            'tokens_cost' => 10,
        ]);

        $this->tutor = User::factory()->create(['role' => 'tutor', 'is_active' => true]);
        $this->tutorProfile = $this->tutor->tutorProfile()->create([
            'title' => 'Dr.',
            'education' => 'PhD Computer Science',
            'experience' => '10 anos',
            'rate' => 100,
            'status' => 'approved',
        ]);
        $this->tutorProfile->specialties()->attach($this->specialty->id);

        $this->student = User::factory()->create(['role' => 'student', 'is_active' => true]);
        $this->student->studentProfile()->create(['education_level' => 'pregrado']);

        // Give student tokens
        Token::create([
            'user_id' => $this->student->id,
            'quantity' => 100,
            'transaction_type' => 'purchase',
        ]);
    }

    public function test_student_can_view_thesis_index(): void
    {
        $this->actingAs($this->student);
        $response = $this->get('/student/thesis');
        $response->assertStatus(200);
    }

    public function test_student_can_create_thesis_review(): void
    {
        $this->actingAs($this->student);

        $file = UploadedFile::fake()->create('tesis.pdf', 1024, 'application/pdf');

        $response = $this->post('/student/thesis', [
            'title' => 'Tesis de Prueba',
            'academic_level' => 'pregrado',
            'description' => 'Una tesis sobre IA',
            'file' => $file,
        ]);

        $this->assertDatabaseHas('thesis_reviews', [
            'student_user_id' => $this->student->id,
            'title' => 'Tesis de Prueba',
            'academic_level' => 'pregrado',
            'status' => 'pending',
        ]);

        // Student tokens should be deducted
        $this->assertEquals(50, $this->student->fresh()->tokens()->where('transaction_type', 'thesis_review')->sum('amount') * -1);
    }

    public function test_tutor_can_view_thesis_index(): void
    {
        $this->actingAs($this->tutor);
        $response = $this->get('/tutor/thesis');
        $response->assertStatus(200);
    }

    public function test_tutor_can_accept_thesis_review(): void
    {
        $thesis = ThesisReview::create([
            'student_user_id' => $this->student->id,
            'tutor_profile_id' => $this->tutorProfile->id,
            'title' => 'Tesis Test',
            'academic_level' => 'pregrado',
            'status' => 'pending',
            'current_round' => 1,
            'max_rounds' => 3,
            'tokens_cost' => 50,
            'file_path' => 'thesis/test.pdf',
        ]);

        $this->actingAs($this->tutor);
        $response = $this->post("/tutor/thesis/{$thesis->id}/accept");

        $this->assertEquals('in_progress', $thesis->fresh()->status);
    }

    public function test_admin_can_view_thesis_index(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $this->actingAs($admin);

        $response = $this->get('/admin/thesis');
        $response->assertStatus(200);
    }

    public function test_admin_can_cancel_thesis_review(): void
    {
        $thesis = ThesisReview::create([
            'student_user_id' => $this->student->id,
            'tutor_profile_id' => $this->tutorProfile->id,
            'title' => 'Tesis Cancel',
            'academic_level' => 'pregrado',
            'status' => 'in_progress',
            'current_round' => 1,
            'max_rounds' => 3,
            'tokens_cost' => 50,
            'file_path' => 'thesis/cancel.pdf',
        ]);

        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $this->actingAs($admin);

        $response = $this->post("/admin/thesis/{$thesis->id}/cancel");
        $this->assertEquals('cancelled', $thesis->fresh()->status);
    }

    public function test_student_cannot_access_tutor_thesis_routes(): void
    {
        $this->actingAs($this->student);
        $response = $this->get('/tutor/thesis');
        $response->assertStatus(403);
    }

    public function test_thesis_tokens_cost_by_academic_level(): void
    {
        // Token costs defined in ThesisReviewController
        $costs = [
            'pregrado' => 50,
            'maestria' => 100,
            'doctorado' => 150,
        ];

        foreach ($costs as $level => $expectedCost) {
            $this->actingAs($this->student);
            $file = UploadedFile::fake()->create('tesis.pdf', 1024, 'application/pdf');

            // Give enough tokens for doctorado
            Token::create([
                'user_id' => $this->student->id,
                'quantity' => 200,
                'transaction_type' => 'purchase',
            ]);

            $response = $this->post('/student/thesis', [
                'title' => "Tesis {$level}",
                'academic_level' => $level,
                'description' => 'Test thesis',
                'file' => $file,
            ]);

            $thesis = \\App\\Models\\ThesisReview::where('title', "Tesis {$level}")->first();
            $this->assertNotNull($thesis);
            $this->assertEquals($expectedCost, $thesis->tokens_cost);
        }
    }
}
