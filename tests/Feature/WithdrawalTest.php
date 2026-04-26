<?php

namespace Tests\Feature;

use App\Models\PlatformSetting;
use App\Models\Token;
use App\Models\TutorProfile;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WithdrawalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Set platform settings
        PlatformSetting::set('min_withdrawal_tokens', 100);
        PlatformSetting::set('token_price_usd', 0.10);
        PlatformSetting::set('commission_rate', 0.8);

        $this->tutor = User::factory()->create(['role' => 'tutor', 'is_active' => true]);
        $this->tutorProfile = $this->tutor->tutorProfile()->create([
            'title' => 'Prof',
            'education' => 'UCV',
            'experience' => '5',
            'rate' => 50,
            'status' => 'approved',
        ]);

        // Give tutor tokens
        Token::create([
            'user_id' => $this->tutor->id,
            'quantity' => 200,
            'transaction_type' => 'session_payment',
        ]);

        $this->admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    public function test_tutor_can_request_withdrawal(): void
    {
        $this->actingAs($this->tutor);

        $response = $this->post('/tutor/withdrawals', [
            'amount' => 150,
            'payment_method' => 'pago_movil',
            'payment_details' => '0414-1234567',
        ]);

        $this->assertDatabaseHas('withdrawals', [
            'tutor_profile_id' => $this->tutorProfile->id,
            'amount' => 150,
            'status' => 'pending',
        ]);
    }

    public function test_tutor_cannot_withdraw_below_minimum(): void
    {
        $this->actingAs($this->tutor);

        $response = $this->post('/tutor/withdrawals', [
            'amount' => 50,
            'payment_method' => 'pago_movil',
            'payment_details' => '0414-1234567',
        ]);

        $response->assertSessionHasErrors('amount');
        $this->assertEquals(0, Withdrawal::count());
    }

    public function test_admin_can_view_withdrawals(): void
    {
        $this->actingAs($this->admin);

        $response = $this->get('/admin/withdrawals');
        $response->assertStatus(200);
    }

    public function test_admin_can_approve_withdrawal(): void
    {
        $withdrawal = Withdrawal::create([
            'tutor_profile_id' => $this->tutorProfile->id,
            'amount' => 150,
            'status' => 'pending',
            'payment_method' => 'pago_movil',
            'payment_details' => '0414-1234567',
        ]);

        $this->actingAs($this->admin);
        $response = $this->post("/admin/withdrawals/{$withdrawal->id}/approve");

        $this->assertEquals('approved', $withdrawal->fresh()->status);
    }

    public function test_admin_can_reject_withdrawal(): void
    {
        $withdrawal = Withdrawal::create([
            'tutor_profile_id' => $this->tutorProfile->id,
            'amount' => 150,
            'status' => 'pending',
            'payment_method' => 'pago_movil',
            'payment_details' => '0414-1234567',
        ]);

        $this->actingAs($this->admin);
        $response = $this->post("/admin/withdrawals/{$withdrawal->id}/reject", [
            'reason' => 'Informacion incorrecta',
        ]);

        $this->assertEquals('rejected', $withdrawal->fresh()->status);
    }

    public function test_student_cannot_access_withdrawal_routes(): void
    {
        $student = User::factory()->create(['role' => 'student', 'is_active' => true]);
        $this->actingAs($student);

        $response = $this->get('/admin/withdrawals');
        $response->assertStatus(403);
    }
}
