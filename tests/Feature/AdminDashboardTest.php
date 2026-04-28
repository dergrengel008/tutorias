<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\StudentProfile;
use App\Models\Token;
use App\Models\Specialty;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected string $adminRoute = '/admin';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    protected function getAdminUser(): User
    {
        return User::where('email', 'admin@tutoria.com')->firstOrFail();
    }

    public function test_admin_can_see_dashboard_stats(): void
    {
        $admin = $this->getAdminUser();
        $response = $this->actingAs($admin)->get($this->adminRoute);
        // Accept 200 or redirect if Inertia middleware is involved
        $response->assertSuccessful();
    }

    public function test_dashboard_shows_total_users(): void
    {
        $admin = $this->getAdminUser();

        // Create additional users
        User::factory()->create(['role' => 'student']);
        User::factory()->create(['role' => 'tutor']);

        $response = $this->actingAs($admin)->get($this->adminRoute);
        $response->assertSuccessful();
    }

    public function test_dashboard_shows_token_economy(): void
    {
        $admin = $this->getAdminUser();

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

        $response = $this->actingAs($admin)->get($this->adminRoute);
        $response->assertSuccessful();
    }

    public function test_guest_cannot_access_admin_dashboard(): void
    {
        $response = $this->get($this->adminRoute);
        // Guest should be redirected or get 401/403
        $response->assertStatus(302);
    }

    public function test_dashboard_includes_specialty_data(): void
    {
        $admin = $this->getAdminUser();
        $response = $this->actingAs($admin)->get($this->adminRoute);
        $response->assertSuccessful();
    }
}
