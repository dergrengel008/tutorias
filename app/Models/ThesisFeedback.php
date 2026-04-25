<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ThesisFeedback extends Model
{
    use HasFactory;

    protected $fillable = [
        'thesis_review_id',
        'round_number',
        'overall_comments',
        'structure_rating',
        'content_rating',
        'methodology_rating',
        'writing_rating',
        'references_rating',
        'detailed_feedback',
        'annotated_file_path',
        'annotated_filename',
    ];

    protected $casts = [
        'structure_rating' => 'integer',
        'content_rating' => 'integer',
        'methodology_rating' => 'integer',
        'writing_rating' => 'integer',
        'references_rating' => 'integer',
        'detailed_feedback' => 'array',
    ];

    protected $appends = ['annotated_file_url'];

    // ─── Relationships ───────────────────────────────────────────

    public function thesisReview(): BelongsTo
    {
        return $this->belongsTo(ThesisReview::class);
    }

    public function getAnnotatedFileUrlAttribute(): ?string
    {
        return $this->annotated_file_path ? Storage::disk('public')->url($this->annotated_file_path) : null;
    }
}
