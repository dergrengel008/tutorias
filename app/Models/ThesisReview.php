<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class ThesisReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_user_id',
        'tutor_profile_id',
        'title',
        'academic_level',
        'subject_area',
        'instructions',
        'file_path',
        'original_filename',
        'status',
        'tokens_cost',
        'tutor_earned_tokens',
        'current_round',
        'max_rounds',
        'final_rating',
        'accepted_at',
        'completed_at',
        'deadline',
    ];

    protected $casts = [
        'tokens_cost' => 'integer',
        'tutor_earned_tokens' => 'integer',
        'current_round' => 'integer',
        'max_rounds' => 'integer',
        'final_rating' => 'integer',
        'accepted_at' => 'datetime',
        'completed_at' => 'datetime',
        'deadline' => 'datetime',
    ];

    // ─── Relationships ───────────────────────────────────────────

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_user_id');
    }

    public function tutorProfile(): BelongsTo
    {
        return $this->belongsTo(TutorProfile::class);
    }

    public function feedbacks(): HasMany
    {
        return $this->hasMany(ThesisFeedback::class)->orderByDesc('round_number');
    }

    public function latestFeedback(): HasMany
    {
        return $this->hasMany(ThesisFeedback::class)->orderByDesc('round_number')->limit(1);
    }

    protected $appends = ['original_file_url', 'feedback_rounds'];

    public function getOriginalFileUrlAttribute(): ?string
    {
        return $this->file_path ? Storage::disk('public')->url($this->file_path) : null;
    }

    public function getFeedbackRoundsAttribute(): array
    {
        return $this->feedbacks->map(function ($feedback) {
            return [
                'id' => $feedback->id,
                'round_number' => $feedback->round_number,
                'general_comments' => $feedback->overall_comments,
                'section_ratings' => [
                    'structure' => $feedback->structure_rating,
                    'content' => $feedback->content_rating,
                    'methodology' => $feedback->methodology_rating,
                    'writing' => $feedback->writing_rating,
                    'references' => $feedback->references_rating,
                ],
                'annotated_file_url' => $feedback->annotated_file_url,
                'annotated_filename' => $feedback->annotated_filename,
                'created_at' => $feedback->created_at ? $feedback->created_at->toIso8601String() : null,
            ];
        })->values()->toArray();
    }

    // ─── Scopes ──────────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInReview($query)
    {
        return $query->where('status', 'in_review');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'in_review', 'needs_revision']);
    }
}
