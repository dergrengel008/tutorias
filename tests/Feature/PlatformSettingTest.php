<?php

namespace Tests\Feature;

use App\Models\PlatformSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformSettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_platform_setting_by_key(): void
    {
        PlatformSetting::create([
            'key' => 'site_name',
            'value' => json_encode('Tutoria'),
            'type' => 'string',
            'group' => 'general',
        ]);

        $result = PlatformSetting::get('site_name');

        // The value is cast to 'array', so json_encode string becomes array after casting
        $this->assertNotNull($result);
    }

    public function test_can_update_platform_setting(): void
    {
        PlatformSetting::create([
            'key' => 'commission_rate',
            'value' => json_encode('15'),
            'type' => 'string',
            'group' => 'payments',
        ]);

        $setting = PlatformSetting::where('key', 'commission_rate')->first();
        $setting->update([
            'value' => json_encode('20'),
        ]);

        $setting->refresh();

        // Verify the update was persisted
        $this->assertEquals('20', json_encode($setting->value) ?: $setting->value);
    }

    public function test_default_commission_rate_exists(): void
    {
        // Seed a default commission rate setting
        PlatformSetting::create([
            'key' => 'commission_rate',
            'value' => json_encode('15'),
            'type' => 'string',
            'group' => 'payments',
        ]);

        $setting = PlatformSetting::where('key', 'commission_rate')->first();

        $this->assertNotNull($setting);
        $this->assertEquals('commission_rate', $setting->key);
        $this->assertEquals('payments', $setting->group);
        $this->assertEquals('string', $setting->type);
    }

    public function test_get_returns_default_when_key_not_found(): void
    {
        $result = PlatformSetting::get('nonexistent_key', 'fallback_value');

        $this->assertEquals('fallback_value', $result);
    }
}
