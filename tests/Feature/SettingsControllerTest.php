<?php

namespace Tests\Feature;

use App\Models\PlatformSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        PlatformSetting::set('platform_name', 'TutoriaApp');
        PlatformSetting::set('commission_rate', '0.8');

        $this->admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    public function test_admin_can_view_settings(): void
    {
        $this->actingAs($this->admin);
        $response = $this->get('/admin/settings');
        $response->assertStatus(200);
    }

    public function test_non_admin_cannot_view_settings(): void
    {
        $student = User::factory()->create(['role' => 'student', 'is_active' => true]);
        $this->actingAs($student);

        $response = $this->get('/admin/settings');
        $response->assertStatus(403);
    }

    public function test_admin_can_update_settings(): void
    {
        $this->actingAs($this->admin);

        $response = $this->post('/admin/settings', [
            'platform_name' => 'Nuevo Nombre',
            'commission_rate' => '0.85',
        ]);

        $this->assertEquals('Nuevo Nombre', PlatformSetting::get('platform_name'));
        $this->assertEquals(0.85, PlatformSetting::get('commission_rate'));
    }

    public function test_admin_cannot_update_disallowed_settings(): void
    {
        $this->actingAs($this->admin);

        $response = $this->post('/admin/settings', [
            'malicious_key' => 'injected_value',
        ]);

        $this->assertNull(PlatformSetting::get('malicious_key'));
    }

    public function test_guest_cannot_access_settings(): void
    {
        $response = $this->get('/admin/settings');
        $response->assertRedirect('/login');
    }
}
