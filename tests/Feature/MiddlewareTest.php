<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\TutorProfile;
use App\Models\StudentProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_guest_cannot_access_admin_routes(): void
    {
        $response = $this->get('/admin/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_student_cannot_access_admin_routes(): void
    {
        $student = User::factory()->create([
            'role' => 'student',
            'is_active' => true,
        ]);
        StudentProfile::create([
            'user_id' => $student->id,
            'education_level' => 'Universitario',
        ]);

        $response = $this->actingAs($student)->get('/admin/dashboard');
        $response->assertStatus(403);
    }

    public function test_admin_can_access_admin_routes(): void
    {
        $admin = User::where('email', 'admin@tutoria.com')->first();
        $response = $this->actingAs($admin)->get('/admin/dashboard');
        $response->assertStatus(200);
    }

    public function test_tutor_profile_has_pending_status(): void
    {
        $tutorUser = User::factory()->create(['role' => 'tutor']);

        $profile = TutorProfile::create([
            'user_id' => $tutorUser->id,
            'professional_title' => 'Tutor',
            'education_level' => 'Universitario',
            'hourly_rate' => 20.00,
        ]);

        $this->assertEquals('pending', $profile->status);
        $this->assertFalse($profile->is_approved);
    }

    public function test_user_role_methods_work(): void
    {
        $admin = User::where('email', 'admin@tutoria.com')->first();
        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($admin->isStudent());
        $this->assertFalse($admin->isTutor());

        $student = User::factory()->create(['role' => 'student']);
        $this->assertFalse($student->isAdmin());
        $this->assertTrue($student->isStudent());

        $tutor = User::factory()->create(['role' => 'tutor']);
        $this->assertFalse($tutor->isAdmin());
        $this->assertTrue($tutor->isTutor());
    }
}
