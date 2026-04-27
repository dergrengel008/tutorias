<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\StudentProfile;
use App\Models\TutorProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    public function test_admin_can_access_dashboard(): void
    {
        $admin = $this->createAdmin();
        $response = $this->actingAs($admin)->get('/admin/dashboard');
        $response->assertStatus(200);
    }

    public function test_student_cannot_access_admin(): void
    {
        $student = User::factory()->create(['role' => 'student', 'is_active' => true]);
        StudentProfile::create(['user_id' => $student->id]);

        $response = $this->actingAs($student)->get('/admin/dashboard');
        $response->assertStatus(403);
    }

    public function test_admin_can_approve_tutor(): void
    {
        $admin = $this->createAdmin();
        $tutor = User::factory()->create(['role' => 'tutor', 'is_active' => true]);
        TutorProfile::create(['user_id' => $tutor->id, 'status' => 'pending', 'is_approved' => false]);

        $this->actingAs($admin)->post("/admin/tutors/{$tutor->tutorProfile->id}/approve");

        $this->assertEquals('approved', $tutor->tutorProfile->fresh()->status);
    }

    public function test_admin_can_reject_tutor(): void
    {
        $admin = $this->createAdmin();
        $tutor = User::factory()->create(['role' => 'tutor', 'is_active' => true]);
        TutorProfile::create(['user_id' => $tutor->id, 'status' => 'pending', 'is_approved' => false]);

        $this->actingAs($admin)->post("/admin/tutors/{$tutor->tutorProfile->id}/reject", [
            'rejection_reason' => 'Documentos inválidos',
        ]);

        $fresh = $tutor->tutorProfile->fresh();
        $this->assertEquals('rejected', $fresh->status);
        $this->assertEquals('Documentos inválidos', $fresh->rejection_reason);
    }

    public function test_admin_can_suspend_tutor(): void
    {
        $admin = $this->createAdmin();
        $tutor = User::factory()->create(['role' => 'tutor', 'is_active' => true]);
        TutorProfile::create(['user_id' => $tutor->id, 'status' => 'approved', 'is_approved' => true]);

        $this->actingAs($admin)->post("/admin/tutors/{$tutor->tutorProfile->id}/suspend");

        $this->assertEquals('suspended', $tutor->tutorProfile->fresh()->status);
        $this->assertFalse($tutor->fresh()->is_active);
    }

    public function test_admin_can_give_tokens(): void
    {
        $admin = $this->createAdmin();
        $student = User::factory()->create(['role' => 'student', 'is_active' => true]);
        StudentProfile::create(['user_id' => $student->id]);

        $this->actingAs($admin)->post('/admin/tokens/give', [
            'user_id' => $student->id,
            'quantity' => 50,
            'description' => 'Bonus tokens',
        ]);

        $latestToken = \App\Models\Token::where('user_id', $student->id)->latest()->first();
        $this->assertNotNull($latestToken);
        $this->assertEquals(50, $latestToken->quantity);
        $this->assertEquals('admin_credit', $latestToken->transaction_type);
    }
}
