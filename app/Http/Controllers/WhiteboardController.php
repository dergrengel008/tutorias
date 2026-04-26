<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\TutoringSession;
use App\Models\SessionMessage;
use App\Events\WhiteboardUpdated;
use App\Events\WhiteboardChatSent;

class WhiteboardController extends Controller
{
    public function show($sessionId)
    {
        $session = TutoringSession::with([
            'tutorProfile.user',
            'student',
        ])->findOrFail($sessionId);

        $userId = Auth::id();
        $isTutor = $session->tutorProfile && $session->tutorProfile->user_id === $userId;
        $isStudent = $session->student_user_id === $userId;

        if (! $isTutor && ! $isStudent) {
            abort(403, 'No tienes acceso a esta pizarra.');
        }

        if ($session->status !== 'in_progress') {
            return redirect()->route('sessions.show', $sessionId)
                ->with('info', 'La pizarra solo está disponible cuando la sesión está en curso.');
        }

        return Inertia::render('Whiteboard/Room', [
            'session'  => $session,
            'isTutor'  => $isTutor,
        ]);
    }

    public function getData($sessionId)
    {
        $session = TutoringSession::findOrFail($sessionId);

        $userId = Auth::id();
        $isTutor = $session->tutorProfile && $session->tutorProfile->user_id === $userId;
        $isStudent = $session->student_user_id === $userId;

        if (! $isTutor && ! $isStudent) {
            abort(403);
        }

        return response()->json([
            'whiteboard_data' => $session->whiteboard_data ?? null,
            'session'         => [
                'id'              => $session->id,
                'title'           => $session->title,
                'status'          => $session->status,
                'started_at'      => $session->started_at,
            ],
        ]);
    }

    public function update(Request $request, $sessionId)
    {
        $session = TutoringSession::findOrFail($sessionId);

        $userId = Auth::id();
        $isTutor = $session->tutorProfile && $session->tutorProfile->user_id === $userId;
        $isStudent = $session->student_user_id === $userId;

        if (! $isTutor && ! $isStudent) {
            abort(403);
        }

        if ($session->status !== 'in_progress') {
            return response()->json(['error' => 'La sesión no está en curso.'], 400);
        }

        $validated = $request->validate([
            'whiteboard_data' => 'required|string',
        ]);

        // Decode the JSON string and store it (model casts it back to array)
        $decoded = json_decode($validated['whiteboard_data'], true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return response()->json(['error' => 'Datos de pizarra inválidos.'], 422);
        }

        $session->update([
            'whiteboard_data' => $decoded,
        ]);

        broadcast(new WhiteboardUpdated($sessionId, $validated['whiteboard_data'], auth()->id()));

        return response()->json([
            'message' => 'Pizarra guardada.',
        ]);
    }

    // ─── Chat Endpoints ───────────────────────────────────────────────

    public function getChat($sessionId)
    {
        $session = TutoringSession::findOrFail($sessionId);

        $userId = Auth::id();
        $isTutor = $session->tutorProfile && $session->tutorProfile->user_id === $userId;
        $isStudent = $session->student_user_id === $userId;

        if (! $isTutor && ! $isStudent) {
            abort(403);
        }

        $messages = $session->messages()
            ->with('user:id,name')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn ($msg) => [
                'id'          => $msg->id,
                'user_name'   => $msg->user->name ?? 'Usuario',
                'message'     => $msg->message,
                'created_at'  => $msg->created_at->toIso8601String(),
                'is_tutor'    => $msg->user_id === ($session->tutorProfile->user_id ?? null),
            ]);

        return response()->json([
            'messages' => $messages,
        ]);
    }

    public function sendChat(Request $request, $sessionId)
    {
        $session = TutoringSession::findOrFail($sessionId);

        $userId = Auth::id();
        $isTutor = $session->tutorProfile && $session->tutorProfile->user_id === $userId;
        $isStudent = $session->student_user_id === $userId;

        if (! $isTutor && ! $isStudent) {
            abort(403);
        }

        if ($session->status !== 'in_progress') {
            return response()->json(['error' => 'La sesión no está en curso.'], 400);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $msg = $session->messages()->create([
            'user_id' => $userId,
            'message' => $validated['message'],
            'type'    => 'whiteboard_chat',
        ]);

        broadcast(new WhiteboardChatSent($sessionId, [
            'id' => $msg->id,
            'user_name' => auth()->user()->name,
            'message' => $msg->message,
            'created_at' => $msg->created_at->toIso8601String(),
            'is_tutor' => $isTutor,
        ]));

        return response()->json([
            'message' => 'Mensaje enviado.',
            'data'    => [
                'id'          => $msg->id,
                'user_name'   => Auth::user()->name,
                'message'     => $msg->message,
                'created_at'  => $msg->created_at->toIso8601String(),
                'is_tutor'    => $isTutor,
            ],
        ]);
    }
}
