<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WhiteboardController;

// Sanctum authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user());

    Route::get('/tokens/balance', function (Request $request) {
        $latestToken = \App\Models\Token::where('user_id', $request->user()->id)
            ->latest('id')->first();
        return response()->json([
            'balance' => $latestToken ? $latestToken->tokens_after : 0,
        ]);
    });

    Route::get('/notifications/unread', function (Request $request) {
        return response()->json(
            $request->user()->notifications()->where('read', false)->latest()->get()
        );
    });

    Route::get('/specialties', function () {
        return response()->json(\App\Models\Specialty::all());
    });

    // Whiteboard routes
    Route::get('/sessions/{sessionId}/whiteboard', [WhiteboardController::class, 'show']);
    Route::put('/sessions/{sessionId}/whiteboard', [WhiteboardController::class, 'update']);
});
