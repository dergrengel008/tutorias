<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Specialty extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'icon',
    ];

    // ─── Relationships ───────────────────────────────────────────────

    public function tutors(): BelongsToMany
    {
        return $this->belongsToMany(TutorProfile::class, 'tutor_specialty')
            ->withTimestamps();
    }
}
