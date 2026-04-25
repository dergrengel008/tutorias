<?php

namespace Tests\Feature\Middleware;

use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function createAdmin(): User
    {
        return User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
    }

    protected function createStudent(): User
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

    protected function createApprovedTutor(): User
    {
        $user = User::create([
            'name' => 'Tutor User',
            'email' => 'tutor@example.com',
            'password' => Hash::make('password'),
            'role' => 'tutor',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        TutorProfile::create([
            'user_id' => $user->id,
            'status' => 'approved',
            'is_approved' => true,
            'average_rating' => 0.00,
            'total_sessions' => 0,
            'total_warnings' => 0,
            'approval_date' => now(),
        ]);

        return $user;
    }

    public function test_admin_can_access_admin_routes(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin)->get('/admin/dashboard');

        $response->assertStatus(200);
    }

    public function test_student_cannot_access_admin_routes(): void
    {
        $student = $this->createStudent();

        $response = $this->actingAs($student)->get('/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_tutor_can_access_tutor_routes(): void
    {
        $tutor = $this->createApprovedTutor();

        $response = $this->actingAs($tutor)->get('/tutor/dashboard');

        $response->assertStatus(200);
    }

    public function test_student_cannot_access_tutor_routes(): void
    {
        $student = $this->createStudent();

        $response = $this->actingAs($student)->get('/tutor/dashboard');

        $response->assertStatus(403);
    }

    public function test_guest_cannot_access_protected_routes(): void
    {
        $response = $this->get('/admin/dashboard');

        $response->assertRedirect('/login');
    }
}
