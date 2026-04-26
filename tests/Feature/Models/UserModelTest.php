<?php

namespace Tests\Feature\Models;

use App\Models\StudentProfile;
use App\Models\Token;
use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_check_is_admin(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create(['role' => 'student']);

        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($student->isAdmin());
    }

    public function test_user_can_check_is_tutor(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor']);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->assertTrue($tutor->isTutor());
        $this->assertFalse($admin->isTutor());
    }

    public function test_user_can_check_is_student(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $tutor = User::factory()->create(['role' => 'tutor']);

        $this->assertTrue($student->isStudent());
        $this->assertFalse($tutor->isStudent());
    }

    public function test_is_approved_tutor_returns_false_without_profile(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor']);
        $this->assertFalse($tutor->isApprovedTutor());
    }

    public function test_is_approved_tutor_returns_false_for_pending(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor']);
        $tutor->tutorProfile()->create(['status' => 'pending']);
        $this->assertFalse($tutor->isApprovedTutor());
    }

    public function test_is_approved_tutor_returns_true_for_approved(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor']);
        $tutor->tutorProfile()->create(['status' => 'approved']);
        $this->assertTrue($tutor->isApprovedTutor());
    }

    public function test_user_has_tutor_profile_relationship(): void
    {
        $user = User::factory()->create(['role' => 'tutor']);
        $profile = $user->tutorProfile()->create([
            'title' => 'Profesor',
            'education' => 'Universidad Central',
            'experience' => '5 anos',
            'rate' => 50,
            'status' => 'approved',
        ]);

        $this->assertEquals($profile->id, $user->tutorProfile->id);
        $this->assertInstanceOf(TutorProfile::class, $user->tutorProfile);
    }

    public function test_user_has_student_profile_relationship(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $profile = $user->studentProfile()->create([
            'education_level' => 'Universitario',
            'institution' => 'UCV',
        ]);

        $this->assertEquals($profile->id, $user->studentProfile->id);
        $this->assertInstanceOf(StudentProfile::class, $user->studentProfile);
    }

    public function test_user_has_tokens_relationship(): void
    {
        $user = User::factory()->create();
        $token = Token::create([
            'user_id' => $user->id,
            'quantity' => 100,
            'transaction_type' => 'purchase',
        ]);

        $this->assertEquals(1, $user->tokens->count());
        $this->assertEquals(100, $user->tokens->first()->quantity);
    }

    public function test_active_scope_returns_only_active_users(): void
    {
        User::factory()->create(['is_active' => true, 'role' => 'student']);
        User::factory()->create(['is_active' => true, 'role' => 'student']);
        User::factory()->create(['is_active' => false, 'role' => 'student']);

        $this->assertEquals(2, User::active()->count());
    }

    public function test_students_scope_returns_only_students(): void
    {
        User::factory()->create(['role' => 'student']);
        User::factory()->create(['role' => 'student']);
        User::factory()->create(['role' => 'tutor']);

        $this->assertEquals(2, User::students()->count());
    }

    public function test_admins_scope_returns_only_admins(): void
    {
        User::factory()->create(['role' => 'admin']);
        User::factory()->create(['role' => 'student']);

        $this->assertEquals(1, User::admins()->count());
    }
}
