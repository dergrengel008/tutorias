<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TokenPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'tokens',
        'bonus_tokens',
        'price_usd',
        'price_ves',
        'is_popular',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'tokens'       => 'integer',
        'bonus_tokens' => 'integer',
        'price_usd'    => 'decimal:2',
        'price_ves'    => 'decimal:2',
        'is_popular'   => 'boolean',
        'is_active'    => 'boolean',
        'sort_order'   => 'integer',
    ];

    // ─── Scopes ──────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePopular($query)
    {
        return $query->where('is_popular', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('price_usd');
    }
}
