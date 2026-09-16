<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;


Route::get('/', function () {
    return response()->json(['message' => 'Support Operations Tracker API']);
});

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->name('login');

Route::middleware('auth')->post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->name('logout');