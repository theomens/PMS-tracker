<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;

Route::post('/login', function (Request $request) {
    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    $token = $user->createToken('auth-token')->plainTextToken;

    return response()->json([
        'message' => 'Signed in.',
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ],
    ])->header('X-Auth-Token', $token);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\ActivityUpdateController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/activities', [ActivityController::class, 'index']);
    Route::post('/activities', [ActivityController::class, 'store']);
    Route::post('/activities/{activity}/updates', [ActivityUpdateController::class, 'store']);
    Route::get('/daily-view', [ActivityUpdateController::class, 'dailyView']);
    Route::get('/reports', [ActivityUpdateController::class, 'report']);
});