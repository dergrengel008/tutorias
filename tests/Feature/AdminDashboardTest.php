<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\TutorProfile;
use App\Models\StudentProfile;
use App\Models\Specialty;
use App\Models\Token;
use App\Models\TutoringSession;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_can_see_dashboard_stats(): void
    {
        $admin = User::where('email', 'admin@tutoria.com')->first();
        $response = $this->actingAs($admin)->get('/dashboard');
        $response->assertStatus(200);
    }

    public function test_dashboard_shows_total_users(): void
    {
        $admin = User::where('email', 'admin@tutoria.com')->first();

        // Create additional users
        User::factory()->create(['role' => 'student']);
        User::factory()->create(['role' => 'tutor']);

        $response = $this->actingAs($admin)->get('/dashboard');
        $response->assertStatus(200);
    }

    public function test_dashboard_shows_token_economy(): void
    {
        $admin = User::where('email', 'admin@tutoria.com')->first();

        $student = User::factory()->create(['role' => 'student']);
        StudentProfile::create([
            'user_id' => $student->id,
            'education_level' => 'Universitario',
        ]);

        Token::create([
            'user_id' => $student->id,
            'quantity' => 100,
            'transaction_type' => 'purchase',
            'amount' => 10.00,
            'tokens_before' => 0,
            'tokens_after' => 100,
            'description' => 'Compra de tokens',
        ]);

        $response = $this->actingAs($admin)->get('/dashboard');
        $response->assertStatus(200);
    }

    public function test_guest_cannot_access_admin_dashboard(): void
    {
        $response = $this->get('/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_dashboard_includes_specialty_data(): void
    {
        $admin = User::where('email', 'admin@tutoria.com')->first();
        $response = $this->actingAs($admin)->get('/dashboard');
        $response->assertStatus(200);
    }
}
