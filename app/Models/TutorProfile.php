<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class TutorProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'professional_title',
        'education_level',
        'years_experience',
        'hourly_rate',
        'id_card_image',
        'title_document',
        'selfie_image',
        'is_approved',
        'approval_date',
        'rejection_reason',
        'average_rating',
        'total_sessions',
        'total_warnings',
        'status',
    ];

    protected $hidden = [
        'id_card_image',
        'title_document',
        'selfie_image',
    ];

    protected function casts(): array
    {
        return [
            'is_approved' => 'boolean',
            'average_rating' => 'decimal:2',
            'hourly_rate' => 'decimal:2',
            'approval_date' => 'datetime',
            'status' => 'string',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function specialties(): BelongsToMany
    {
        return $this->belongsToMany(Specialty::class, 'tutor_specialty')
            ->withTimestamps();
    }

    public function courses(): HasMany
    {
        return $this->hasMany(TutorCourse::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(TutoringSession::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function getIdCardImageUrlAttribute(): ?string
    {
        return $this->id_card_image ? Storage::url($this->id_card_image) : null;
    }

    public function getTitleDocumentUrlAttribute(): ?string
    {
        return $this->title_document ? Storage::url($this->title_document) : null;
    }

    public function getSelfieImageUrlAttribute(): ?string
    {
        return $this->selfie_image ? Storage::url($this->selfie_image) : null;
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeSuspended($query)
    {
        return $query->where('status', 'suspended');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'approved');
    }
}
