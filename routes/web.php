<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TutorController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\TokenController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\WhiteboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\WithdrawalController;
use App\Http\Controllers\ThesisReviewController;
use App\Http\Controllers\MessageController;

// Public routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/about', [HomeController::class, 'about'])->name('about');
Route::get('/pricing', [HomeController::class, 'pricing'])->name('pricing');
Route::get('/search', [SearchController::class, 'search'])->name('search');
Route::get('/tutors', [SearchController::class, 'search'])->name('tutors.index');
Route::get('/tutors/{id}', [StudentController::class, 'viewTutor'])->name('tutors.show');

// Password reset (public, guest)
Route::middleware(['guest', 'throttle:3,1'])->group(function () {
    Route::get('/forgot-password', [ForgotPasswordController::class, 'showForgotForm'])->name('password.request');
    Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink'])->name('password.email');
    Route::get('/reset-password/{token}', [ForgotPasswordController::class, 'showResetForm'])->name('password.reset');
    Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword'])->name('password.update');
});

// Auth routes with rate limiting
Route::middleware(['guest', 'throttle:5,1'])->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

// Authenticated routes
Route::middleware(['auth'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Profile management (all authenticated users)
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar'])->name('profile.avatar');
    Route::put('/profile/password', [ProfileController::class, 'changePassword'])->name('profile.password');

    // Student routes
    Route::middleware('role:student')->prefix('student')->name('student.')->group(function () {
        Route::get('/dashboard', [StudentController::class, 'dashboard'])->name('dashboard');
        Route::get('/profile', [StudentController::class, 'profile'])->name('profile');
        Route::get('/profile/edit', [StudentController::class, 'profile'])->name('profile.edit');
        Route::put('/profile', [StudentController::class, 'updateProfile']);
        Route::get('/sessions', [StudentController::class, 'sessions'])->name('sessions');
        Route::get('/sessions/index', [StudentController::class, 'sessions'])->name('sessions.index');
        Route::post('/sessions/book', [SessionController::class, 'book'])->name('sessions.book');
        Route::get('/tokens', [TokenController::class, 'index'])->name('tokens.index');
        Route::post('/tokens/topup', [TokenController::class, 'requestTopUp'])->name('tokens.topup');
        Route::get('/find-tutors', [StudentController::class, 'findTutors'])->name('find-tutors');

        // Student Thesis routes
        Route::get('/thesis', [ThesisReviewController::class, 'studentIndex'])->name('thesis.index');
        Route::get('/thesis/create', [ThesisReviewController::class, 'studentCreate'])->name('thesis.create');
        Route::post('/thesis', [ThesisReviewController::class, 'studentStore'])->name('thesis.store');
        Route::get('/thesis/{id}', [ThesisReviewController::class, 'studentShow'])->name('thesis.show');
        Route::post('/thesis/{id}/request-revision', [ThesisReviewController::class, 'studentRequestRevision'])->name('thesis.request-revision');
        Route::post('/thesis/{id}/rate', [ThesisReviewController::class, 'studentRate'])->name('thesis.rate');
        Route::post('/thesis/{id}/cancel', [ThesisReviewController::class, 'studentCancel'])->name('thesis.cancel');
    });

    // Tutor routes (con middleware approved.tutor)
    Route::middleware(['role:tutor', 'approved.tutor'])->prefix('tutor')->name('tutor.')->group(function () {
        Route::get('/dashboard', [TutorController::class, 'dashboard'])->name('dashboard');
        Route::get('/profile', [TutorController::class, 'profile'])->name('profile');
        Route::get('/profile/edit', [TutorController::class, 'profile'])->name('profile.edit');
        Route::put('/profile', [TutorController::class, 'updateProfile']);
        Route::get('/courses', [TutorController::class, 'courses'])->name('courses.index');
        Route::post('/courses', [TutorController::class, 'storeCourse']);
        Route::delete('/courses/{id}', [TutorController::class, 'destroyCourse']);
        Route::put('/specialties', [TutorController::class, 'updateSpecialties']);
        Route::get('/specialties', function () {
            return redirect()->route('tutor.profile.edit');
        })->name('specialties.index');
        Route::get('/sessions', [TutorController::class, 'sessions'])->name('sessions.index');
        Route::get('/students', [TutorController::class, 'myStudents'])->name('students.index');
        Route::get('/students/{id}', [TutorController::class, 'showStudent'])->name('students.show');
        Route::get('/earnings', [TutorController::class, 'earnings'])->name('earnings.index');

        // Tutor thesis review routes
        Route::get('/thesis', [ThesisReviewController::class, 'tutorIndex'])->name('thesis.index');
        Route::get('/thesis/{id}', [ThesisReviewController::class, 'tutorShow'])->name('thesis.show');
        Route::post('/thesis/{id}/accept', [ThesisReviewController::class, 'tutorAccept'])->name('thesis.accept');
        Route::post('/thesis/{id}/feedback', [ThesisReviewController::class, 'tutorSubmitFeedback'])->name('thesis.feedback');
        Route::get('/thesis/{id}/download', [ThesisReviewController::class, 'tutorDownload'])->name('thesis.download');

        // Tutor withdrawal routes
        Route::post('/withdrawals', [WithdrawalController::class, 'store'])->name('withdrawals.store');
    });

    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/tutors/pending', [AdminController::class, 'pendingTutors'])->name('tutors.pending');
        Route::post('/tutors/{id}/approve', [AdminController::class, 'approveTutor'])->name('tutors.approve');
        Route::post('/tutors/{id}/reject', [AdminController::class, 'rejectTutor'])->name('tutors.reject');
        Route::post('/tutors/{id}/suspend', [AdminController::class, 'suspendTutor'])->name('tutors.suspend');
        Route::post('/tutors/{id}/activate', [AdminController::class, 'activateTutor'])->name('tutors.activate');
        Route::get('/tutors', [AdminController::class, 'allTutors'])->name('tutors.index');
        Route::get('/students', [AdminController::class, 'allStudents'])->name('students.index');
        Route::get('/students/{id}', [AdminController::class, 'showStudent'])->name('students.show');
        Route::post('/students/{id}/activate', [AdminController::class, 'activateStudent'])->name('students.activate');
        Route::post('/students/{id}/deactivate', [AdminController::class, 'deactivateStudent'])->name('students.deactivate');
        Route::get('/sessions', [AdminController::class, 'sessions'])->name('sessions.index');
        Route::get('/specialties', [AdminController::class, 'manageSpecialties'])->name('specialties.index');
        Route::post('/specialties', [AdminController::class, 'storeSpecialty']);
        Route::put('/specialties/{id}', [AdminController::class, 'updateSpecialty']);
        Route::delete('/specialties/{id}', [AdminController::class, 'destroySpecialty']);
        Route::post('/tokens/give', [AdminController::class, 'giveTokens'])->name('tokens.give');
        Route::get('/reviews', [AdminController::class, 'manageReviews'])->name('reviews.index');
        Route::delete('/reviews/{id}', [AdminController::class, 'destroyReview']);
        Route::get('/warnings', [AdminController::class, 'warnings'])->name('warnings.index');
        Route::post('/warnings', [AdminController::class, 'storeWarning'])->name('warnings.store');

        // Payment receipts (Pago Móvil)
        Route::get('/payment-receipts', [AdminController::class, 'paymentReceipts'])->name('payment-receipts.index');
        Route::post('/payment-receipts/{id}/approve', [TokenController::class, 'approveReceipt'])->name('payment-receipts.approve');
        Route::post('/payment-receipts/{id}/reject', [TokenController::class, 'rejectReceipt'])->name('payment-receipts.reject');

        // Admin thesis management
        Route::get('/thesis', [ThesisReviewController::class, 'adminIndex'])->name('thesis.index');
        Route::post('/thesis/{id}/cancel', [ThesisReviewController::class, 'adminCancel'])->name('thesis.cancel');

        // Admin withdrawals management
        Route::get('/withdrawals', [WithdrawalController::class, 'index'])->name('withdrawals.index');
        Route::post('/withdrawals/{id}/approve', [WithdrawalController::class, 'approve'])->name('withdrawals.approve');
        Route::post('/withdrawals/{id}/reject', [WithdrawalController::class, 'reject'])->name('withdrawals.reject');

        // Admin platform settings
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
    });

    // Shared authenticated routes
    Route::get('/sessions/{id}', [SessionController::class, 'show'])->name('sessions.show');
    Route::post('/sessions/{id}/start', [SessionController::class, 'start'])->name('sessions.start');
    Route::post('/sessions/{id}/end', [SessionController::class, 'end'])->name('sessions.end');
    Route::post('/sessions/{id}/cancel', [SessionController::class, 'cancel'])->name('sessions.cancel');
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::get('/whiteboard/{sessionId}', [WhiteboardController::class, 'show'])->name('whiteboard.show');

    // Messaging routes
    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::get('/messages/{id}', [MessageController::class, 'show'])->name('messages.show');
    Route::post('/messages', [MessageController::class, 'store'])->name('messages.store');
    Route::post('/conversations', [MessageController::class, 'startConversation'])->name('conversations.start');
    Route::delete('/messages/{id}', [MessageController::class, 'destroy'])->name('messages.destroy');
});

// Whiteboard API routes (for real-time sync)
Route::middleware(['auth'])->prefix('api/whiteboard')->group(function () {
    Route::get('/{sessionId}', [WhiteboardController::class, 'getData']);
    Route::post('/{sessionId}', [WhiteboardController::class, 'update']);
    Route::get('/{sessionId}/chat', [WhiteboardController::class, 'getChat']);
    Route::post('/{sessionId}/chat', [WhiteboardController::class, 'sendChat']);
});
