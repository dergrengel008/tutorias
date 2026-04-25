<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Review;
use App\Models\TutorProfile;
use App\Models\TutoringSession;
use App\Events\ReviewSubmitted;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tutoring_session_id' => 'required|exists:tutoring_sessions,id',
            'tutor_profile_id'    => 'required|exists:tutor_profiles,id',
            'rating'              => 'required|integer|min:1|max:5',
            'comment'             => 'nullable|string|max:1000',
            'type'                => 'required|in:review,warning',
            'is_anonymous'        => 'nullable|boolean',
        ]);

        $session = TutoringSession::findOrFail($validated['tutoring_session_id']);
        $tutor = TutorProfile::findOrFail($validated['tutor_profile_id']);

        // Only the student of the session can review (or admin for warnings)
        if ($validated['type'] === 'review') {
            if ($session->student_user_id !== Auth::id()) {
                abort(403, 'Solo el estudiante puede dejar una reseña.');
            }

            if ($session->status !== 'completed') {
                abort(400, 'Solo se pueden reseñar sesiones completadas.');
            }

            // Check if review already exists
            $existingReview = Review::where('tutoring_session_id', $session->id)
                ->where('reviewer_user_id', Auth::id())
                ->where('type', 'review')
                ->exists();

            if ($existingReview) {
                return back()->withErrors(['error' => 'Ya has dejado una reseña para esta sesión.']);
            }
        }

        // Admin only for warnings
        if ($validated['type'] === 'warning' && ! Auth::user()->isAdmin()) {
            abort(403, 'Solo los administradores pueden emitir advertencias.');
        }

        $review = Review::create([
            'tutoring_session_id' => $validated['tutoring_session_id'],
            'reviewer_user_id'    => Auth::id(),
            'tutor_profile_id'    => $validated['tutor_profile_id'],
            'rating'              => $validated['rating'],
            'comment'             => $validated['comment'] ?? null,
            'type'                => $validated['type'],
            'is_anonymous'        => $validated['is_anonymous'] ?? false,
        ]);

        // Recalculate tutor average rating (only for reviews, not warnings)
        if ($validated['type'] === 'review') {
            $allReviews = Review::where('tutor_profile_id', $tutor->id)
                ->where('type', 'review')
                ->get();

            $newAverage = $allReviews->avg('rating');
            $tutor->update(['average_rating' => round($newAverage, 2)]);
        }

        // If warning type, increment total_warnings
        if ($validated['type'] === 'warning') {
            $tutor->increment('total_warnings');

            // Auto-suspend after 3 warnings
            if ($tutor->total_warnings >= 3) {
                $tutor->update(['status' => 'suspended']);
                $tutor->user->update(['is_active' => false]);
            }
        }

        event(new ReviewSubmitted($review));

        $request->session()->flash('success', $validated['type'] === 'review'
            ? '¡Reseña publicada exitosamente!'
            : 'Advertencia registrada exitosamente.');

        return redirect()->back();
    }

    public function index($tutorProfileId)
    {
        $tutor = TutorProfile::findOrFail($tutorProfileId);

        $reviews = Review::where('tutor_profile_id', $tutor->id)
            ->where('type', 'review')
            ->with(['reviewer'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Reviews/Index', [
            'tutor'   => $tutor,
            'reviews' => $reviews,
        ]);
    }

    public function destroy($id)
    {
        $review = Review::findOrFail($id);

        // Only admin or review owner can delete
        if (! Auth::user()->isAdmin() && $review->reviewer_user_id !== Auth::id()) {
            abort(403);
        }

        $tutor = $review->tutorProfile;

        // Recalculate tutor average rating
        $remainingReviews = Review::where('tutor_profile_id', $tutor->id)
            ->where('type', 'review')
            ->where('id', '!=', $id)
            ->get();

        if ($remainingReviews->count() > 0) {
            $newAverage = $remainingReviews->avg('rating');
            $tutor->update(['average_rating' => round($newAverage, 2)]);
        } else {
            $tutor->update(['average_rating' => 0]);
        }

        // If it was a warning, decrement total_warnings
        if ($review->type === 'warning') {
            $tutor->decrement('total_warnings');
        }

        $review->delete();

        return redirect()->back()->with('success', 'Reseña eliminada exitosamente.');
    }
}
