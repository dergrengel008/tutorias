<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'tutoring_session_id',
        'reviewer_user_id',
        'reviewer_id',
        'tutor_profile_id',
        'rating',
        'comment',
        'type',
        'is_anonymous',
        'severity',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => 'string',
            'is_anonymous' => 'boolean',
        ];
    }

    // ─── Relationships ───────────────────────────────────────────────

    public function session(): BelongsTo
    {
        return $this->belongsTo(TutoringSession::class, 'tutoring_session_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_user_id');
    }

    public function adminReviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function tutorProfile(): BelongsTo
    {
        return $this->belongsTo(TutorProfile::class);
    }

    // ─── Scopes ──────────────────────────────────────────────────────

    public function scopeReviews($query)
    {
        return $query->where('type', 'review');
    }

    public function scopeWarnings($query)
    {
        return $query->where('type', 'warning');
    }

    public function scopeAnonymous($query)
    {
        return $query->where('is_anonymous', true);
    }

    public function scopeIdentified($query)
    {
        return $query->where('is_anonymous', false);
    }
}
