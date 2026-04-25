<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class StudentProfile extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'education_level',
        'institution',
        'id_card_image',
        'selfie_image',
        'total_sessions_completed',
    ];

    protected $hidden = [
        'id_card_image',
        'selfie_image',
    ];

    // ─── Relationships ───────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ─── Accessors ───────────────────────────────────────────────────

    public function getIdCardImageUrlAttribute(): ?string
    {
        if ($this->id_card_image) {
            return Storage::url($this->id_card_image);
        }

        return null;
    }

    public function getSelfieImageUrlAttribute(): ?string
    {
        if ($this->selfie_image) {
            return Storage::url($this->selfie_image);
        }

        return null;
    }
}
