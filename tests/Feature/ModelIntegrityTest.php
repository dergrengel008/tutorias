<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\TutorProfile;
use App\Models\StudentProfile;
use App\Models\Specialty;
use App\Models\Token;
use App\Models\Notification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelIntegrityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_user_factory_creates_valid_users(): void
    {
        $user = User::factory()->create([
            'role' => 'student',
            'email' => 'factory@test.com',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'factory@test.com',
            'role' => 'student',
        ]);

        $this->assertInstanceOf(User::class, $user);
    }

    public function test_tutor_profile_creation(): void
    {
        $tutorUser = User::factory()->create(['role' => 'tutor']);

        $profile = TutorProfile::create([
            'user_id' => $tutorUser->id,
            'professional_title' => 'Ingeniero de Sistemas',
            'education_level' => 'Universitario',
            'hourly_rate' => 30.00,
            'status' => 'pending',
        ]);

        $this->assertEquals($tutorUser->id, $profile->user_id);
        $this->assertEquals('pending', $profile->status);

        // Relationship test
        $this->assertEquals($profile->id, $tutorUser->tutorProfile->id);
    }

    public function test_student_profile_creation(): void
    {
        $studentUser = User::factory()->create(['role' => 'student']);

        $profile = StudentProfile::create([
            'user_id' => $studentUser->id,
            'education_level' => 'Universitario',
            'institution' => 'USB',
        ]);

        $this->assertEquals($studentUser->id, $profile->user_id);
        $this->assertEquals('USB', $profile->institution);

        // Relationship test
        $this->assertEquals($profile->id, $studentUser->studentProfile->id);
    }

    public function test_token_model(): void
    {
        $studentUser = User::factory()->create(['role' => 'student']);
        StudentProfile::create([
            'user_id' => $studentUser->id,
            'education_level' => 'Bachillerato',
        ]);

        $token = Token::create([
            'user_id' => $studentUser->id,
            'transaction_type' => 'purchase',
            'quantity' => 10,
            'amount' => 5.00,
            'description' => 'Compra de paquete',
        ]);

        $this->assertDatabaseHas('tokens', [
            'user_id' => $studentUser->id,
            'quantity' => 10,
        ]);
    }

    public function test_notification_model(): void
    {
        $user = User::factory()->create(['role' => 'student']);

        $notification = Notification::create([
            'user_id' => $user->id,
            'title' => 'Sesion programada',
            'message' => 'Tu sesion ha sido confirmada.',
            'type' => 'session',
            'is_read' => false,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $user->id,
            'title' => 'Sesion programada',
        ]);
    }

    public function test_user_scopes(): void
    {
        User::factory()->create(['role' => 'student', 'is_active' => true]);
        User::factory()->create(['role' => 'student', 'is_active' => false]);

        $activeStudents = User::students()->active()->get();
        $allStudents = User::students()->get();

        $this->assertLessThan($allStudents->count(), $activeStudents->count());
    }

    public function test_specialty_tutor_relationship(): void
    {
        $tutorUser = User::factory()->create(['role' => 'tutor']);
        $profile = TutorProfile::create([
            'user_id' => $tutorUser->id,
            'professional_title' => 'Multi-especialista',
            'education_level' => 'Doctorado',
            'hourly_rate' => 50.00,
            'status' => 'approved',
        ]);

        $math = Specialty::where('name', 'Matemáticas')->first();
        $physics = Specialty::where('name', 'Física')->first();

        $profile->specialties()->attach([$math->id, $physics->id]);

        $this->assertCount(2, $profile->specialties);
        $this->assertTrue($profile->specialties->contains($math->id));
        $this->assertTrue($profile->specialties->contains($physics->id));
    }

    public function test_platform_settings_seeded(): void
    {
        $this->assertDatabaseHas('platform_settings', ['key' => 'commission_rate']);
        $this->assertDatabaseHas('platform_settings', ['key' => 'platform_name']);
        $this->assertDatabaseHas('platform_settings', ['key' => 'token_price_usd']);
    }
}
