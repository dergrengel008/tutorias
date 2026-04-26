<?php

namespace Tests\Feature;

use App\Models\PlatformSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformSettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_setting_value(): void
    {
        PlatformSetting::create([
            'key' => 'test_setting',
            'value' => 'test_value',
            'type' => 'string',
        ]);

        $this->assertEquals('test_value', PlatformSetting::get('test_setting'));
    }

    public function test_get_returns_default_when_not_found(): void
    {
        $this->assertEquals('default_val', PlatformSetting::get('nonexistent', 'default_val'));
    }

    public function test_can_set_setting_value(): void
    {
        PlatformSetting::set('new_key', 'new_value');

        $this->assertDatabaseHas('platform_settings', [
            'key' => 'new_key',
            'value' => 'new_value',
        ]);
    }

    public function test_set_updates_existing_setting(): void
    {
        PlatformSetting::create([
            'key' => 'update_key',
            'value' => 'old_value',
            'type' => 'string',
        ]);

        PlatformSetting::set('update_key', 'new_value');

        $this->assertEquals('new_value', PlatformSetting::get('update_key'));
    }

    public function test_get_casts_integer_type(): void
    {
        PlatformSetting::create([
            'key' => 'int_setting',
            'value' => '42',
            'type' => 'integer',
        ]);

        $this->assertSame(42, PlatformSetting::get('int_setting'));
    }

    public function test_get_casts_boolean_type(): void
    {
        PlatformSetting::create([
            'key' => 'bool_setting',
            'value' => '1',
            'type' => 'boolean',
        ]);

        $this->assertTrue(PlatformSetting::get('bool_setting'));
    }

    public function test_get_casts_float_type(): void
    {
        PlatformSetting::create([
            'key' => 'float_setting',
            'value' => '3.14',
            'type' => 'float',
        ]);

        $this->assertEquals(3.14, PlatformSetting::get('float_setting'));
    }

    public function test_get_casts_json_type(): void
    {
        PlatformSetting::create([
            'key' => 'json_setting',
            'value' => '{"key":"value"}',
            'type' => 'json',
        ]);

        $result = PlatformSetting::get('json_setting');
        $this->assertEquals(['key' => 'value'], $result);
    }
}
