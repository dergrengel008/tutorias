<?php

use Illuminate\Support\Facades\Broadcast;

// Channel for real-time whiteboard sync
Broadcast::channel('whiteboard.{sessionId}', function ($user, $sessionId) {
    if (!$user->is_active) return false;

    $session = \App\Models\TutoringSession::findOrFail($sessionId);
    return $user->id === $session->student_user_id
        || ($user->tutorProfile
            && $user->tutorProfile->id === $session->tutor_profile_id
            && $user->tutorProfile->status === 'approved');
});

// Channel for user notifications
Broadcast::channel('notifications.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
