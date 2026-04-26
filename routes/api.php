<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TokenController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ThesisReviewController;
use App\Http\Controllers\ForgotPasswordController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/tokens/balance', [TokenController::class, 'getBalance']);
    Route::get('/notifications/unread', [NotificationController::class, 'unreadCount']);
    Route::get('/specialties', [SearchController::class, 'getSpecialties']);

    // Broadcasting auth
    Route::middleware('auth')->post('/broadcasting/auth', function () {
        return response()->json(['auth' => true]);
    });

    // ── Mobile API Routes ──────────────────────────────────

    // Auth
    Route::post('/auth/login', [AuthController::class, 'apiLogin']);
    Route::post('/auth/register', [AuthController::class, 'apiRegister']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // User
    Route::get('/user/profile', [ProfileController::class, 'apiProfile']);
    Route::put('/user/profile', [ProfileController::class, 'updateProfile']);

    // Tutors
    Route::get('/tutors', [SearchController::class, 'apiSearch']);
    Route::get('/tutors/{id}', [SearchController::class, 'apiShowTutor']);
    Route::get('/specialties', [SearchController::class, 'getSpecialties']);

    // Sessions
    Route::get('/sessions', [SessionController::class, 'apiIndex']);
    Route::get('/sessions/{id}', [SessionController::class, 'apiShow']);
    Route::post('/sessions/book', [SessionController::class, 'book']);
    Route::post('/sessions/{id}/start', [SessionController::class, 'start']);
    Route::post('/sessions/{id}/end', [SessionController::class, 'end']);
    Route::post('/sessions/{id}/cancel', [SessionController::class, 'cancel']);

    // Tokens
    Route::get('/tokens/transactions', [TokenController::class, 'apiTransactions']);
    Route::post('/tokens/topup', [TokenController::class, 'requestTopUp']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'apiIndex']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    // Messages
    Route::get('/conversations', [MessageController::class, 'apiConversations']);
    Route::get('/conversations/{id}/messages', [MessageController::class, 'apiMessages']);
    Route::post('/conversations', [MessageController::class, 'startConversation']);
    Route::post('/messages', [MessageController::class, 'store']);

    // Reviews
    Route::get('/tutors/{id}/reviews', [ReviewController::class, 'apiTutorReviews']);
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Thesis
    Route::get('/thesis', [ThesisReviewController::class, 'apiIndex']);
    Route::post('/thesis', [ThesisReviewController::class, 'studentStore']);
    Route::get('/thesis/{id}', [ThesisReviewController::class, 'studentShow']);
});

// Guest auth routes (rate limited)
Route::middleware(['throttle:5,1'])->group(function () {
    Route::post('/auth/login', [AuthController::class, 'apiLogin']);
    Route::post('/auth/register', [AuthController::class, 'apiRegister']);
    Route::post('/auth/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
    Route::post('/auth/reset-password', [ForgotPasswordController::class, 'resetPassword']);
});
