<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\Token;
use App\Models\TutorProfile;
use App\Models\Specialty;
use App\Models\Review;

class StudentController extends Controller
{
    public function dashboard()
    {
        $student = Auth::user()->studentProfile;

        if (! $student) {
            return redirect()->route('student.profile')->with('info', 'Completa tu perfil para comenzar.');
        }

        $upcomingSessions = TutoringSession::where('student_user_id', Auth::id())
            ->whereIn('status', ['scheduled'])
            ->with(['tutorProfile.user', 'tutorProfile.specialties'])
            ->orderBy('scheduled_at')
            ->limit(5)
            ->get();

        $currentBalance = $this->getTokenBalance();

        $recentReviews = Review::where('reviewer_user_id', Auth::id())
            ->where('type', 'review')
            ->with(['tutorProfile.user'])
            ->latest()
            ->limit(5)
            ->get();

        $averageRatingGiven = Review::where('reviewer_user_id', Auth::id())
            ->where('type', 'review')
            ->avg('rating') ?? 0;

        $stats = [
            'totalSessions'        => TutoringSession::where('student_user_id', Auth::id())->where('status', 'completed')->count(),
            'upcomingSessions'     => TutoringSession::where('student_user_id', Auth::id())->where('status', 'scheduled')->count(),
            'tokenBalance'         => $currentBalance,
            'average_rating_given' => round((float) $averageRatingGiven, 2),
        ];

        // ─── Chart Data: Monthly Activity (last 6 months) ───
        $monthlyActivity = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $label = $date->locale('es')->translatedFormat('M');
            $tokensSpent = (int) Token::where('user_id', Auth::id())
                ->where('transaction_type', 'session_payment')
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('quantity');
            $sessionsCompleted = TutoringSession::where('student_user_id', Auth::id())
                ->where('status', 'completed')
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            $monthlyActivity[] = [
                'month'    => $label,
                'tokens'   => $tokensSpent,
                'sesiones' => $sessionsCompleted,
            ];
        }

        return Inertia::render('Student/Dashboard', [
            'student'          => $student,
            'stats'            => $stats,
            'upcomingSessions' => $upcomingSessions,
            'recentReviews'    => $recentReviews,
            'monthlyActivity'  => $monthlyActivity,
        ]);
    }

    public function profile()
    {
        $student = Auth::user()->studentProfile ?? StudentProfile::create([
            'user_id'                => Auth::id(),
            'total_sessions_completed' => 0,
        ]);

        return Inertia::render('Student/Profile', [
            'profile' => $student,
            'user'    => Auth::user(),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'phone'           => 'nullable|string|max:20',
            'city'            => 'nullable|string|max:100',
            'country'         => 'nullable|string|max:100',
            'bio'             => 'nullable|string|max:2000',
            'address'         => 'nullable|string|max:255',
            'latitude'        => 'nullable|numeric|between:-90,90',
            'longitude'       => 'nullable|numeric|between:-180,180',
            'education_level' => 'nullable|string|max:255',
            'institution'     => 'nullable|string|max:255',
            'selfie_image'    => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'id_card_image'   => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $user = Auth::user();
        $student = $user->studentProfile;

        // Update user fields
        $user->update([
            'name'      => $validated['name'],
            'phone'     => $validated['phone'],
            'city'      => $validated['city'],
            'country'   => $validated['country'],
            'bio'       => $validated['bio'],
            'address'   => $validated['address'],
            'latitude'  => $validated['latitude'],
            'longitude' => $validated['longitude'],
        ]);

        // Handle file uploads
        $uploadPath = "students/{$user->id}";

        if ($request->hasFile('selfie_image')) {
            $path = $request->file('selfie_image')->store($uploadPath, 'public');
            $validated['selfie_image'] = $path;
        } else {
            unset($validated['selfie_image']);
        }

        if ($request->hasFile('id_card_image')) {
            $path = $request->file('id_card_image')->store($uploadPath, 'public');
            $validated['id_card_image'] = $path;
        } else {
            unset($validated['id_card_image']);
        }

        // Update student profile
        $student->update([
            'education_level' => $validated['education_level'],
            'institution'     => $validated['institution'],
            'selfie_image'    => $validated['selfie_image'] ?? $student->selfie_image,
            'id_card_image'   => $validated['id_card_image'] ?? $student->id_card_image,
        ]);

        $request->session()->flash('success', 'Perfil actualizado exitosamente.');

        return redirect()->back();
    }

    public function sessions()
    {
        $upcomingSessions = TutoringSession::where('student_user_id', Auth::id())
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->with(['tutorProfile.user', 'tutorProfile.specialties'])
            ->orderBy('scheduled_at')
            ->get();

        $pastSessions = TutoringSession::where('student_user_id', Auth::id())
            ->whereIn('status', ['completed', 'cancelled'])
            ->with(['tutorProfile.user'])
            ->orderByDesc('scheduled_at')
            ->paginate(10);

        return Inertia::render('Student/Sessions', [
            'upcomingSessions' => $upcomingSessions,
            'pastSessions'     => $pastSessions,
        ]);
    }

    public function findTutors()
    {
        $specialties = Specialty::all();

        $tutors = TutorProfile::where('status', 'approved')
            ->with(['user', 'specialties'])
            ->orderByDesc('average_rating')
            ->paginate(12);

        return Inertia::render('Student/FindTutors', [
            'tutors'     => $tutors,
            'specialties' => $specialties,
        ]);
    }

    public function viewTutor($id)
    {
        $tutor = TutorProfile::where('id', $id)
            ->where('status', 'approved')
            ->with(['user', 'specialties', 'courses'])
            ->firstOrFail();

        $reviews = Review::where('tutor_profile_id', $tutor->id)
            ->where('type', 'review')
            ->with(['reviewer'])
            ->latest()
            ->paginate(10);

        $avgRating = $tutor->average_rating;
        $totalReviews = $reviews->total();

        return Inertia::render('Tutor/PublicProfile', [
            'tutor'        => $tutor,
            'reviews'      => $reviews,
            'avgRating'    => $avgRating,
            'totalReviews' => $totalReviews,
        ]);
    }

    private function getTokenBalance(): int
    {
        $latestToken = Token::where('user_id', Auth::id())
            ->latest()
            ->first();

        return $latestToken ? $latestToken->tokens_after : 0;
    }
}
