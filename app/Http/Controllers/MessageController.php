<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\Notification;

class MessageController extends Controller
{
    /**
     * List conversations for the authenticated user.
     */
    public function index()
    {
        $user = Auth::user();

        $conversations = Conversation::where('student_user_id', $user->id)
            ->orWhere('tutor_user_id', $user->id)
            ->with(['student', 'tutor', 'lastMessage'])
            ->orderByDesc('last_message_at')
            ->paginate(20);

        // Append unread counts
        $conversations->transform(function ($conversation) use ($user) {
            $conversation->unread_count = $conversation->unreadCount($user->id);
            return $conversation;
        });

        return Inertia::render('Messages/Index', [
            'conversations' => $conversations,
        ]);
    }

    /**
     * Get messages for a conversation and mark them as read.
     */
    public function show($id)
    {
        $user = Auth::user();

        $conversation = Conversation::where('id', $id)
            ->where(function ($query) use ($user) {
                $query->where('student_user_id', $user->id)
                    ->orWhere('tutor_user_id', $user->id);
            })
            ->firstOrFail();

        // Mark unread messages as read
        $conversation->messages()
            ->where('sender_user_id', '!=', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        // Update conversation timestamp
        $conversation->update(['last_message_at' => $conversation->last_message_at]);

        $messages = $conversation->messages()
            ->with('sender')
            ->paginate(50);

        return Inertia::render('Messages/Show', [
            'conversation' => $conversation->load('student', 'tutor'),
            'messages' => $messages,
        ]);
    }

    /**
     * Send a message in a conversation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'content' => 'required|string|max:5000',
        ]);

        $user = Auth::user();

        $conversation = Conversation::where('id', $validated['conversation_id'])
            ->where(function ($query) use ($user) {
                $query->where('student_user_id', $user->id)
                    ->orWhere('tutor_user_id', $user->id);
            })
            ->firstOrFail();

        $message = Message::create([
            'conversation_id' => $validated['conversation_id'],
            'sender_user_id' => $user->id,
            'content' => $validated['content'],
        ]);

        // Update conversation's last_message_at
        $conversation->update([
            'last_message_at' => $message->created_at,
        ]);

        // Notify the other participant
        $otherUser = $conversation->otherParticipant($user->id);

        Notification::create([
            'user_id' => $otherUser->id,
            'title' => 'Nuevo mensaje',
            'message' => $user->name . ' te ha enviado un mensaje.',
            'type' => 'new_message',
            'data' => [
                'conversation_id' => $conversation->id,
                'message_id' => $message->id,
            ],
        ]);

        return back()->with('success', 'Mensaje enviado.');
    }

    /**
     * Create or find a conversation between student and tutor.
     */
    public function startConversation(Request $request)
    {
        $validated = $request->validate([
            'other_user_id' => 'required|exists:users,id',
        ]);

        $user = Auth::user();
        $otherUserId = $validated['other_user_id'];
        $otherUser = \App\Models\User::findOrFail($otherUserId);

        // Determine who is student and who is tutor
        if ($user->isStudent() && $otherUser->isApprovedTutor()) {
            $studentUserId = $user->id;
            $tutorUserId = $otherUserId;

            // Check if student has had sessions with this tutor or any approved tutor is fine
            // (per requirements: student can message any approved tutor)
        } elseif ($user->isApprovedTutor() && $otherUser->isStudent()) {
            $studentUserId = $otherUserId;
            $tutorUserId = $user->id;
        } else {
            return back()->withErrors(['error' => 'Las conversaciones son solo entre estudiantes y tutores aprobados.']);
        }

        // Check if student has had sessions with this tutor
        $hasSession = TutoringSession::where('student_user_id', $studentUserId)
            ->whereHas('tutorProfile', function ($query) use ($tutorUserId) {
                $query->where('user_id', $tutorUserId);
            })
            ->exists();

        // Allow messaging any approved tutor even without prior sessions
        $tutorProfile = TutorProfile::where('user_id', $tutorUserId)
            ->where('status', 'approved')
            ->first();

        if (!$tutorProfile && !$hasSession) {
            return back()->withErrors(['error' => 'No puedes iniciar una conversación con este usuario.']);
        }

        // Find or create conversation
        $conversation = Conversation::firstOrCreate(
            [
                'student_user_id' => $studentUserId,
                'tutor_user_id' => $tutorUserId,
            ]
        );

        return redirect()->route('messages.show', $conversation->id)
            ->with('success', 'Conversación iniciada.');
    }

    /**
     * Delete a conversation (only if the user is a participant).
     */
    public function destroy($id)
    {
        $user = Auth::user();

        $conversation = Conversation::where('id', $id)
            ->where(function ($query) use ($user) {
                $query->where('student_user_id', $user->id)
                    ->orWhere('tutor_user_id', $user->id);
            })
            ->firstOrFail();

        $conversation->delete();

        return redirect()->route('messages.index')
            ->with('success', 'Conversación eliminada.');
    }
}
