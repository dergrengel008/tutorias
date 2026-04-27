<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    protected function casts(): array
    {
        return [
            'accepted_at' => 'datetime',
            'completed_at' => 'datetime',
            'deadline' => 'datetime',
            'final_rating' => 'integer',
            'tokens_cost' => 'integer',
            'tutor_earned_tokens' => 'integer',
            'current_round' => 'integer',
            'max_rounds' => 'integer',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_user_id');
    }

    public function tutorProfile(): BelongsTo
    {
        return $this->belongsTo(TutorProfile::class);
    }
}
