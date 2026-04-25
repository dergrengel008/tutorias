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

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'professional_title',
        'education_level',
        'years_experience',
        'hourly_rate',
        'id_card_image',
        'title_document',
        'selfie_image',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'id_card_image',
        'title_document',
        'selfie_image',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
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

    // ─── Relationships ───────────────────────────────────────────────

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

    // ─── Accessors ───────────────────────────────────────────────────

    public function getIdCardImageUrlAttribute(): ?string
    {
        if ($this->id_card_image) {
            return Storage::url($this->id_card_image);
        }

        return null;
    }

    public function getTitleDocumentUrlAttribute(): ?string
    {
        if ($this->title_document) {
            return Storage::url($this->title_document);
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

    // ─── Scopes ──────────────────────────────────────────────────────

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
