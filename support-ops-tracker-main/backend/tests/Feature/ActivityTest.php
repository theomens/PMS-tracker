<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\ActivityUpdate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create([
            'name' => 'Irene Support',
            'email' => 'irene@npontu-support.com',
            'password' => bcrypt('irene'),
        ]);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/activities');
        $response->assertStatus(401);

        $response = $this->getJson('/api/daily-view?date=2026-09-09');
        $response->assertStatus(401);
    }

    public function test_can_create_activity(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/activities', [
            'name' => 'Daily SMS count in comparison to SMScount from logs',
            'description' => 'Cross-check delivery metrics',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('name', 'Daily SMS count in comparison to SMScount from logs')
            ->assertJsonPath('created_by', $this->user->id);

        $this->assertDatabaseHas('activities', [
            'name' => 'Daily SMS count in comparison to SMScount from logs',
            'created_by' => $this->user->id,
        ]);
    }

    public function test_can_update_activity_status_and_remark_capturing_user_and_time(): void
    {
        $activity = Activity::create([
            'name' => 'Daily SMS count in comparison to SMScount from logs',
            'created_by' => $this->user->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')->postJson("/api/activities/{$activity->id}/updates", [
            'status' => 'done',
            'remark' => 'Reconciled 15,400 SMS; 0 discrepancies found.',
            'activity_date' => '2026-09-09',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'done')
            ->assertJsonPath('remark', 'Reconciled 15,400 SMS; 0 discrepancies found.')
            ->assertJsonPath('user.name', 'Irene Support')
            ->assertJsonPath('user.email', 'irene@npontu-support.com');

        $this->assertDatabaseHas('activity_updates', [
            'activity_id' => $activity->id,
            'user_id' => $this->user->id,
            'status' => 'done',
            'activity_date' => '2026-09-09',
        ]);
    }

    public function test_daily_view_returns_activities_and_updates_for_date(): void
    {
        $activity = Activity::create([
            'name' => 'Daily SMS count in comparison to SMScount from logs',
            'created_by' => $this->user->id,
            'is_active' => true,
        ]);

        ActivityUpdate::create([
            'activity_id' => $activity->id,
            'user_id' => $this->user->id,
            'status' => 'pending',
            'remark' => 'Awaiting night logs',
            'activity_date' => '2026-09-09',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/daily-view?date=2026-09-09');

        $response->assertOk()
            ->assertJsonPath('date', '2026-09-09')
            ->assertJsonCount(1, 'activities')
            ->assertJsonPath('activities.0.name', 'Daily SMS count in comparison to SMScount from logs')
            ->assertJsonPath('activities.0.updates.0.status', 'pending')
            ->assertJsonPath('activities.0.updates.0.user.name', 'Irene Support');
    }

    public function test_reports_returns_updates_in_custom_duration(): void
    {
        $activity = Activity::create([
            'name' => 'Daily SMS count in comparison to SMScount from logs',
            'created_by' => $this->user->id,
            'is_active' => true,
        ]);

        ActivityUpdate::create([
            'activity_id' => $activity->id,
            'user_id' => $this->user->id,
            'status' => 'done',
            'remark' => 'Done for Sept 1',
            'activity_date' => '2026-09-01',
        ]);

        ActivityUpdate::create([
            'activity_id' => $activity->id,
            'user_id' => $this->user->id,
            'status' => 'pending',
            'remark' => 'Pending for Sept 5',
            'activity_date' => '2026-09-05',
        ]);

        ActivityUpdate::create([
            'activity_id' => $activity->id,
            'user_id' => $this->user->id,
            'status' => 'done',
            'remark' => 'Out of range',
            'activity_date' => '2026-09-15',
        ]);

        // Query date range
        $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/reports?from=2026-09-01&to=2026-09-10');
        $response->assertOk()->assertJsonCount(2);

        // Query with status filter
        $responsePending = $this->actingAs($this->user, 'sanctum')->getJson('/api/reports?from=2026-09-01&to=2026-09-10&status=pending');
        $responsePending->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.status', 'pending');
    }
}
