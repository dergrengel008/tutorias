<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlatformSetting extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'array',
        ];
    }

    // ─── Scopes ──────────────────────────────────────────────────────

    public function scopeKey($query, string $key)
    {
        return $query->where('key', $key);
    }

    public function scopeGroup($query, string $group)
    {
        return $query->where('group', $group);
    }

    // ─── Helper Methods ──────────────────────────────────────────────

    /**
     * Get a setting value by key. Returns the raw value or default.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();

        if (! $setting) {
            return $default;
        }

        // The 'value' column is cast to array, but many settings store scalar strings.
        // Return the raw casted value (which may be array for JSON, or string for plain text).
        return $setting->value;
    }

    /**
     * Get a setting value as a string.
     */
    public static function getString(string $key, string $default = ''): string
    {
        $value = static::get($key, $default);

        if (is_array($value)) {
            return json_encode($value);
        }

        return (string) $value;
    }
}
