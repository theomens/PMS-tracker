<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_with_a_company_email_and_correct_password_can_sign_in(): void
    {
        $user = User::factory()->create([
            'email' => 'ama.mensah@npontu-support.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/login', [
            'email' => 'ama.mensah@npontu-support.com',
            'password' => 'password123',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertOk()
            ->assertJsonPath('user.email', 'ama.mensah@npontu-support.com');
    }

    public function test_a_non_company_email_is_rejected_even_with_the_correct_password(): void
    {
        // Simulates someone whose account was somehow seeded with a
        // personal address, or an attacker guessing at credentials —
        // either way the domain rule must block it before auth runs.
        User::factory()->create([
            'email' => 'test.npontu@gmail.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/login', [
            'email' => 'test.npontu@@gmail.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
        $this->assertGuest();
    }

    public function test_an_incorrect_password_is_rejected(): void
    {
        User::factory()->create([
            'email' => 'kwame.owusu@npontu-support.com',
            'password' => bcrypt('correct-password'),
        ]);

        $response = $this->postJson('/login', [
            'email' => 'kwame.owusu@npontu-support.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
        $this->assertGuest();
    }

    public function test_a_hardcoded_fallback_password_is_not_used_when_the_user_has_a_different_password(): void
    {
        User::factory()->create([
            'email' => 'evelyn.owusu@npontu-support.com',
            'password' => bcrypt('secure-pass-2026'),
        ]);

        $response = $this->postJson('/login', [
            'email' => 'evelyn.owusu@npontu-support.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
        $this->assertGuest();
    }

    public function test_repeated_failed_attempts_are_rate_limited(): void
    {
        User::factory()->create([
            'email' => 'sarah.boateng@npontu-support.com',
            'password' => bcrypt('correct-password'),
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/login', [
                'email' => 'sarah.boateng@npontu-support.com',
                'password' => 'wrong-password',
            ]);
        }

        // 6th attempt, even with the right password, should now be throttled.
        $response = $this->postJson('/login', [
            'email' => 'sarah.boateng@npontu-support.com',
            'password' => 'correct-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
        $this->assertGuest();
    }

    public function test_successful_login_returns_the_expected_response_structure(): void
    {
        $user = User::factory()->create([
            'name' => 'Irene',
            'email' => 'irene@npontu-support.com',
            'password' => bcrypt('irene@123'),
        ]);

        $response = $this->postJson('/login', [
            'email' => 'irene@npontu-support.com',
            'password' => 'irene@123',
        ]);

        $response->assertOk()
            ->assertExactJson([
                'message' => 'Signed in.',
                'user' => [
                    'id' => $user->id,
                    'name' => 'Irene',
                    'email' => 'irene@npontu-support.com',
                ],
            ]);
    }

    public function test_successful_api_login_returns_the_expected_response_structure(): void
    {
        $user = User::factory()->create([
            'name' => 'Irene',
            'email' => 'irene@npontu-support.com',
            'password' => bcrypt('irene@123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'irene@npontu-support.com',
            'password' => 'irene@123',
        ]);

        $response->assertOk()
            ->assertExactJson([
                'message' => 'Signed in.',
                'user' => [
                    'id' => $user->id,
                    'name' => 'Irene',
                    'email' => 'irene@npontu-support.com',
                ],
            ]);
    }

    public function test_already_authenticated_user_can_login_again_without_redirect(): void
    {
        $user = User::factory()->create([
            'name' => 'Irene',
            'email' => 'irene@npontu-support.com',
            'password' => bcrypt('irene'),
        ]);

        $this->actingAs($user);

        $response = $this->postJson('/login', [
            'email' => 'irene@npontu-support.com',
            'password' => 'irene',
        ]);

        $response->assertOk()
            ->assertExactJson([
                'message' => 'Signed in.',
                'user' => [
                    'id' => $user->id,
                    'name' => 'Irene',
                    'email' => 'irene@npontu-support.com',
                ],
            ]);
    }
}