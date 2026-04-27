<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlatformSetting extends Model
{
    use HasFactory;

    protected $fillable = ['key', 'value', 'type', 'group'];

    protected $casts = ['value' => 'string'];

    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        if (!$setting) return $default;
        return match ($setting->type) {
            'integer' => (int) $setting->getRawOriginal('value'),
            'boolean' => in_array($setting->getRawOriginal('value'), ['1', 'true', true], true),
            'float' => (float) $setting->getRawOriginal('value'),
            default => $setting->value,
        };
    }

    public static function set(string $key, string $value, string $type = 'string', string $group = 'general'): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value, 'type' => $type, 'group' => $group]);
    }
}
