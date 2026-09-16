<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityUpdate;
use Illuminate\Http\Request;

class ActivityUpdateController extends Controller
{
    // POST /api/activities/{activity}/updates
    public function store(Request $request, Activity $activity)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,done',
            'remark' => 'nullable|string',
            'activity_date' => 'nullable|date',
        ]);

        $update = ActivityUpdate::create([
            'activity_id' => $activity->id,
            'user_id' => $request->user()->id,
            'status' => $validated['status'],
            'remark' => $validated['remark'] ?? null,
            'activity_date' => $validated['activity_date'] ?? now()->toDateString(),
        ]);

        $update->load('user:id,name,email');

        return response()->json($update, 201);
    }

    // GET /api/daily-view?date=2026-09-09
    public function dailyView(Request $request)
    {
        $date = $request->query('date', now()->toDateString());

        $activities = Activity::where('is_active', true)
            ->with(['updates' => function ($q) use ($date) {
                $q->where('activity_date', $date)
                  ->with('user:id,name,email')
                  ->orderBy('created_at');
            }])
            ->orderBy('name')
            ->get();

        return response()->json([
            'date' => $date,
            'activities' => $activities,
        ]);
    }

    // GET /api/reports?from=2026-09-01&to=2026-09-09&activity_id=optional&status=optional
    public function report(Request $request)
    {
        $validated = $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
            'activity_id' => 'nullable|exists:activities,id',
            'status' => 'nullable|in:pending,done',
        ]);

        $query = ActivityUpdate::whereBetween('activity_date', [$validated['from'], $validated['to']])
            ->with(['activity:id,name', 'user:id,name,email'])
            ->orderBy('activity_date', 'desc')
            ->orderBy('created_at', 'desc');

        if (!empty($validated['activity_id'])) {
            $query->where('activity_id', $validated['activity_id']);
        }

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        return response()->json($query->get());
    }
}