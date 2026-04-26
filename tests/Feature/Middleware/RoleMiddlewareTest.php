<?php

namespace Tests\Feature\Middleware;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_protected_route(): void
    {
        $response = $this->get('/student/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_student_cannot_access_admin_routes(): void
    {
        $student = User::factory()->create(['role' => 'student', 'is_active' => true]);
        $this->actingAs($student);

        $response = $this->get('/admin/dashboard');
        $response->assertStatus(403);
    }

    public function test_admin_can_access_admin_routes(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $this->actingAs($admin);

        $response = $this->get('/admin/dashboard');
        $response->assertStatus(200);
    }

    public function test_tutor_cannot_access_student_routes(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor', 'is_active' => true]);
        $this->actingAs($tutor);

        $response = $this->get('/student/dashboard');
        $response->assertStatus(403);
    }

    public function test_student_cannot_access_tutor_routes(): void
    {
        $student = User::factory()->create(['role' => 'student', 'is_active' => true]);
        $this->actingAs($student);

        $response = $this->get('/tutor/dashboard');
        $response->assertStatus(403);
    }

    public function test_inactive_user_cannot_access_any_role_route(): void
    {
        $student = User::factory()->create(['role' => 'student', 'is_active' => false]);
        $this->actingAs($student);

        $response = $this->get('/student/dashboard');
        $response->assertStatus(403);
    }

    public function test_admin_cannot_access_student_routes(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $this->actingAs($admin);

        $response = $this->get('/student/dashboard');
        $response->assertStatus(403);
    }

    public function test_approved_tutor_can_access_tutor_routes(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor', 'is_active' => true]);
        $tutor->tutorProfile()->create(['status' => 'approved']);

        $this->actingAs($tutor);

        $response = $this->get('/tutor/dashboard');
        $response->assertStatus(200);
    }

    public function test_pending_tutor_cannot_access_tutor_routes(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor', 'is_active' => true]);
        $tutor->tutorProfile()->create(['status' => 'pending']);

        $this->actingAs($tutor);

        $response = $this->get('/tutor/dashboard');
        $response->assertStatus(403);
    }

    public function test_suspended_tutor_cannot_access_tutor_routes(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor', 'is_active' => false]);
        $tutor->tutorProfile()->create(['status' => 'suspended']);

        $this->actingAs($tutor);

        $response = $this->get('/tutor/dashboard');
        $response->assertStatus(403);
    }
}
