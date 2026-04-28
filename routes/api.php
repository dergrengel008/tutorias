<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TokenController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SearchController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/tokens/balance', [TokenController::class, 'getBalance']);
    Route::get('/notifications/unread', [NotificationController::class, 'unreadCount']);
    Route::get('/specialties', [SearchController::class, 'getSpecialties']);
});
