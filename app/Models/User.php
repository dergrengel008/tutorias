<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
          protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'phone',
        'address',
        'city',
        'country',
        'bio',
        'latitude',
        'longitude',
        'is_active',
    
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'is_active' => 'boolean',
        ];
    }

    // ─── Relationships ───────────────────────────────────────────────

    public function tutorProfile(): HasOne
    {
        return $this->hasOne(TutorProfile::class);
    }

    public function studentProfile(): HasOne
    {
        return $this->hasOne(StudentProfile::class);
    }

    public function tokens(): HasMany
    {
        return $this->hasMany(Token::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function reviewsGiven(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewer_user_id');
    }

    public function tutoringSessions(): HasMany
    {
        return $this->hasMany(TutoringSession::class, 'student_user_id');
    }

    // ─── Role Helpers ────────────────────────────────────────────────

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isTutor(): bool
    {
        return $this->role === 'tutor';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function isApprovedTutor(): bool
    {
        return $this->isTutor()
            && $this->tutorProfile
            && $this->tutorProfile->is_approved;
    }

    public function getRoleNames(): array
    {
        return [$this->role];
    }

    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    // ─── Accessors ───────────────────────────────────────────────────

    /**
     * Override avatar attribute to always return the full storage URL.
     * Raw DB value (e.g. "avatars/1-xxx.jpg") is accessible via getRawOriginal('avatar').
     */
    public function getAvatarAttribute($value): ?string
    {
        return $value ? Storage::url($value) : null;
    }

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar;
    }

    // ─── Scopes ──────────────────────────────────────────────────────

    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    public function scopeTutors($query)
    {
        return $query->where('role', 'tutor');
    }

    public function scopeStudents($query)
    {
        return $query->where('role', 'student');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
