<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\TutorProfile;
use App\Models\Specialty;
use App\Models\User;
use App\Models\TutoringSession;
use App\Models\Review;

class HomeController extends Controller
{
    public function index()
    {
        $featuredTutors = TutorProfile::where('status', 'approved')
            ->with(['user', 'specialties'])
            ->where('average_rating', '>=', 4)
            ->orderByDesc('average_rating')
            ->limit(6)
            ->get();

        $specialties = Specialty::all();

        $stats = [
            'totalTutors'   => TutorProfile::where('status', 'approved')->count(),
            'totalStudents' => User::where('role', 'student')->count(),
            'totalSessions' => TutoringSession::where('status', 'completed')->count(),
            'totalReviews'  => Review::where('type', 'review')->count(),
        ];

        return Inertia::render('Home', [
            'featuredTutors' => $featuredTutors,
            'specialties'    => $specialties,
            'stats'          => $stats,
        ]);
    }

    public function about()
    {
        return Inertia::render('About');
    }

    public function pricing()
    {
        $tokenPackages = [
            ['tokens' => 50,  'price' => 5.00,   'label' => 'Básico'],
            ['tokens' => 120, 'price' => 10.00,  'label' => 'Popular'],
            ['tokens' => 250, 'price' => 18.00,  'label' => 'Avanzado'],
            ['tokens' => 500, 'price' => 30.00,  'label' => 'Premium'],
            ['tokens' => 1000,'price' => 50.00,  'label' => 'Empresa'],
        ];

        return Inertia::render('Pricing', [
            'packages' => $tokenPackages,
        ]);
    }
}
