<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Specialty extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'icon',
    ];

    public function tutors(): BelongsToMany
    {
        return $this->belongsToMany(TutorProfile::class, 'tutor_specialty')
            ->withTimestamps();
    }

    public function tutorProfiles(): BelongsToMany
    {
        return $this->belongsToMany(TutorProfile::class, 'tutor_specialty')
            ->withTimestamps();
    }
}
