<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\TutorProfile;
use App\Models\Specialty;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = TutorProfile::where('status', 'approved')
            ->with(['user', 'specialties']);

        // Search by name
        if ($request->filled('name')) {
            $name = str_replace(['%', '_'], ['\%', '\_'], $request->input('name'));
            $query->whereHas('user', function ($q) use ($name) {
                $q->where('name', 'LIKE', "%{$name}%");
            });
        }

        // Filter by specialty
        if ($request->filled('specialty_id')) {
            $query->whereHas('specialties', function ($q) use ($request) {
                $q->where('specialties.id', $request->input('specialty_id'));
            });
        }

        // Filter by city
        if ($request->filled('city')) {
            $city = str_replace(['%', '_'], ['\%', '\_'], $request->input('city'));
            $query->whereHas('user', function ($q) use ($city) {
                $q->where('city', 'LIKE', "%{$city}%");
            });
        }

        // Filter by minimum rating
        if ($request->filled('min_rating')) {
            $query->where('average_rating', '>=', (float) $request->input('min_rating'));
        }

        // Filter by max hourly rate
        if ($request->filled('max_rate')) {
            $query->where('hourly_rate', '<=', (float) $request->input('max_rate'));
        }

        // Filter by education level
        if ($request->filled('education_level')) {
            $query->where('education_level', $request->input('education_level'));
        }

        // Sort
        $sort = $request->input('sort', 'rating');
        match ($sort) {
            'rating'       => $query->orderByDesc('average_rating'),
            'experience'   => $query->orderByDesc('years_experience'),
            'price_low'    => $query->orderBy('hourly_rate'),
            'price_high'   => $query->orderByDesc('hourly_rate'),
            'newest'       => $query->latest(),
            'sessions'     => $query->orderByDesc('total_sessions'),
            default        => $query->orderByDesc('average_rating'),
        };

        $tutors = $query->paginate(12)->withQueryString();

        $specialties = Specialty::all();

        return Inertia::render('Search/Results', [
            'tutors'      => $tutors,
            'specialties' => $specialties,
            'filters'     => $request->only([
                'name', 'specialty_id', 'city', 'min_rating', 'max_rate', 'education_level', 'sort',
            ]),
        ]);
    }

    public function getSpecialties()
    {
        return response()->json(Specialty::all());
    }
}
