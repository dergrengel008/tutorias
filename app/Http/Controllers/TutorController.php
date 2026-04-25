<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\TutorProfile;
use App\Models\TutorCourse;
use App\Models\TutoringSession;
use App\Models\Token;
use App\Models\User;
use App\Models\Review;
use App\Models\Specialty;
use Carbon\Carbon;

class TutorController extends Controller
{
    public function dashboard()
    {
        $tutor = Auth::user()->tutorProfile;

        if (! $tutor) {
            return redirect()->route('tutor.profile')->with('info', 'Completa tu perfil para comenzar.');
        }

        $stats = [
            'completed_sessions' => TutoringSession::where('tutor_profile_id', $tutor->id)->where('status', 'completed')->count(),
            'average_rating'     => (float) ($tutor->average_rating ?? 0),
            'total_earnings'     => Token::where('user_id', Auth::id())->where('transaction_type', 'session_payment')->sum('quantity'),
            'total_students'     => TutoringSession::where('tutor_profile_id', $tutor->id)->distinct('student_user_id')->count('student_user_id'),
        ];

        $upcomingSessions = TutoringSession::where('tutor_profile_id', $tutor->id)
            ->whereIn('status', ['scheduled'])
            ->with(['student'])
            ->orderBy('scheduled_at')
            ->limit(5)
            ->get();

        $recentReviews = Review::where('tutor_profile_id', $tutor->id)
            ->where('type', 'review')
            ->with(['reviewer'])
            ->latest()
            ->limit(5)
            ->get();

        // ─── Chart Data: Monthly Earnings (last 6 months) ───
        $monthlyEarnings = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $label = $date->locale('es')->translatedFormat('M');
            $tokens = (int) Token::where('user_id', Auth::id())
                ->where('transaction_type', 'session_payment')
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('quantity');
            $sessions = TutoringSession::where('tutor_profile_id', $tutor->id)
                ->where('status', 'completed')
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            $monthlyEarnings[] = [
                'month'    => $label,
                'tokens'   => $tokens,
                'sesiones' => $sessions,
            ];
        }

        return Inertia::render('Tutor/Dashboard', [
            'tutor'             => $tutor->load(['user', 'specialties']),
            'stats'             => $stats,
            'profileStatus'     => $tutor->status,
            'rejectionReason'   => $tutor->rejection_reason,
            'upcomingSessions'  => $upcomingSessions,
            'recentReviews'     => $recentReviews,
            'monthlyEarnings'   => $monthlyEarnings,
        ]);
    }

    public function profile()
    {
        $tutor = Auth::user()->tutorProfile ?? TutorProfile::create([
            'user_id'         => Auth::id(),
            'status'          => 'pending',
            'is_approved'     => false,
            'average_rating'  => 0,
            'total_sessions'  => 0,
            'total_warnings'  => 0,
        ]);

        $specialties = Specialty::all();

        return Inertia::render('Tutor/Profile', [
            'profile'     => $tutor,
            'user'        => Auth::user(),
            'specialties' => $specialties,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name'               => 'required|string|max:255',
            'phone'              => 'nullable|string|max:20',
            'city'               => 'nullable|string|max:100',
            'country'            => 'nullable|string|max:100',
            'bio'                => 'nullable|string|max:2000',
            'latitude'           => 'nullable|numeric',
            'longitude'          => 'nullable|numeric',
            'professional_title' => 'required|string|max:255',
            'education_level'    => 'required|string|max:255',
            'years_experience'   => 'required|integer|min:0',
            'hourly_rate'        => 'required|numeric|min:0',
            'selfie_image'       => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'id_card_image'      => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'title_document'     => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120',
        ]);

        $user = Auth::user();
        $tutor = $user->tutorProfile;

        $user->update([
            'name'      => $validated['name'],
            'phone'     => $validated['phone'],
            'city'      => $validated['city'],
            'country'   => $validated['country'],
            'bio'       => $validated['bio'],
            'latitude'  => $validated['latitude'],
            'longitude' => $validated['longitude'],
        ]);

        $uploadPath = "tutors/{$user->id}";

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

        if ($request->hasFile('title_document')) {
            $path = $request->file('title_document')->store($uploadPath, 'public');
            $validated['title_document'] = $path;
        } else {
            unset($validated['title_document']);
        }

        $tutor->update([
            'professional_title' => $validated['professional_title'],
            'education_level'    => $validated['education_level'],
            'years_experience'   => $validated['years_experience'],
            'hourly_rate'        => $validated['hourly_rate'],
            'selfie_image'       => $validated['selfie_image'] ?? $tutor->selfie_image,
            'id_card_image'      => $validated['id_card_image'] ?? $tutor->id_card_image,
            'title_document'     => $validated['title_document'] ?? $tutor->title_document,
        ]);

        if ($tutor->status === 'rejected') {
            $tutor->update(['status' => 'pending', 'rejection_reason' => null]);
        }

        // Save specialties if sent
        if ($request->has('specialties')) {
            $request->validate([
                'specialties' => 'nullable|array',
                'specialties.*' => 'exists:specialties,id',
            ]);
            $tutor->specialties()->sync($request->input('specialties', []));
        }

        $request->session()->flash('success', 'Perfil actualizado exitosamente.');

        return redirect()->back();
    }

    public function courses()
    {
        $tutor = Auth::user()->tutorProfile;
        $courses = $tutor ? $tutor->courses()->latest()->get() : collect();

        return Inertia::render('Tutor/Courses', [
            'courses' => $courses,
        ]);
    }

    public function storeCourse(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'file_path'   => 'required|file|mimes:pdf,doc,docx|max:10240',
            'institution' => 'nullable|string|max:255',
            'year'        => 'nullable|integer|min:1950|max:' . (date('Y') + 1),
        ]);

        $tutor = Auth::user()->tutorProfile;

        if ($request->hasFile('file_path')) {
            $path = $request->file('file_path')->store("tutors/{$tutor->user_id}/courses", 'public');
            $validated['file_path'] = $path;
        }

        $tutor->courses()->create($validated);

        $request->session()->flash('success', 'Curso/documento agregado exitosamente.');

        return redirect()->back();
    }

    public function destroyCourse($id)
    {
        $course = TutorCourse::where('id', $id)
            ->whereHas('tutorProfile', fn ($q) => $q->where('user_id', Auth::id()))
            ->firstOrFail();

        if ($course->file_path) {
            \Storage::disk('public')->delete($course->file_path);
        }

        $course->delete();

        return redirect()->back()->with('success', 'Curso eliminado exitosamente.');
    }

    public function updateSpecialties(Request $request)
    {
        $request->validate([
            'specialty_ids' => 'array',
            'specialty_ids.*' => 'exists:specialties,id',
        ]);

        $tutor = Auth::user()->tutorProfile;
        $tutor->specialties()->sync($request->input('specialty_ids', []));

        $request->session()->flash('success', 'Especialidades actualizadas exitosamente.');

        return redirect()->back();
    }

    public function sessions()
    {
        $tutor = Auth::user()->tutorProfile;

        $upcomingSessions = TutoringSession::where('tutor_profile_id', $tutor->id)
            ->whereIn('status', ['scheduled'])
            ->with(['student'])
            ->orderBy('scheduled_at')
            ->get();

        $pastSessions = TutoringSession::where('tutor_profile_id', $tutor->id)
            ->whereIn('status', ['completed', 'cancelled'])
            ->with(['student'])
            ->orderByDesc('scheduled_at')
            ->get();

        $inProgressSessions = TutoringSession::where('tutor_profile_id', $tutor->id)
            ->where('status', 'in_progress')
            ->with(['student'])
            ->orderBy('scheduled_at')
            ->get();

        // Merge all into single array for the page
        $allSessions = collect()
            ->merge($inProgressSessions)
            ->merge($upcomingSessions)
            ->merge($pastSessions);

        return Inertia::render('Tutor/Sessions', [
            'sessions' => $allSessions,
        ]);
    }

    public function myStudents()
    {
        $tutor = Auth::user()->tutorProfile;

        $students = TutoringSession::where('tutor_profile_id', $tutor->id)
            ->where('status', 'completed')
            ->with(['student'])
            ->select('student_user_id')
            ->selectRaw('COUNT(*) as total_sessions')
            ->selectRaw('MAX(scheduled_at) as last_session')
            ->groupBy('student_user_id')
            ->orderByDesc('last_session')
            ->get();

        // Transform to the format the frontend expects
        $transformed = $students->map(function ($item) {
            return [
                'id'             => $item->student_user_id,
                'name'           => $item->student?->name ?? 'Estudiante',
                'email'          => $item->student?->email,
                'avatar'         => $item->student?->avatar,
                'total_sessions' => $item->total_sessions,
                'last_session'   => $item->last_session,
            ];
        });

        return Inertia::render('Tutor/Students', [
            'students' => $transformed,
        ]);
    }

    public function showStudent($id)
    {
        $student = User::where('id', $id)->where('role', 'student')->firstOrFail();

        $tutor = Auth::user()->tutorProfile;
        
        // Verify tutor has had sessions with this student
        $hasSession = TutoringSession::where('tutor_profile_id', $tutor->id)
            ->where('student_user_id', $id)
            ->exists();
        
        if (! $hasSession && ! Auth::user()->isAdmin()) {
            abort(403, 'No tienes permiso para ver este estudiante.');
        }

        $sessions = TutoringSession::where('tutor_profile_id', $tutor->id)
            ->where('student_user_id', $id)
            ->with(['student'])
            ->orderByDesc('scheduled_at')
            ->get();

        return Inertia::render('Tutor/Students/Show', [
            'student'  => $student,
            'sessions' => $sessions,
        ]);
    }

    public function earnings()
    {
        $tutor = Auth::user()->tutorProfile;

        $transactions = Token::where('user_id', Auth::id())
            ->where('transaction_type', 'session_payment')
            ->latest()
            ->paginate(15);

        $totalEarnings = Token::where('user_id', Auth::id())
            ->where('transaction_type', 'session_payment')
            ->sum('quantity');

        $currentBalance = $this->getTokenBalance();

        return Inertia::render('Tutor/Earnings', [
            'transactions'   => $transactions,
            'totalEarnings'  => $totalEarnings,
            'currentBalance' => $currentBalance,
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
