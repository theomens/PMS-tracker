<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use App\Rules\CompanyEmailDomain;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Anyone may attempt to log in; the domain rule below decides eligibility.
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', new CompanyEmailDomain],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials against the
     * 'web' guard. Deliberately checked AFTER the domain rule has
     * already passed via validated(), so a personal email is rejected
     * before we even touch the password / hit the database for auth.
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Basic brute-force protection: 5 attempts per email+IP combination
     * before a cool-down is enforced. This is a non-functional
     * requirement (security) not stated explicitly in the brief, but
     * expected of any system authenticating access to operational data.
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => "Too many login attempts. Please try again in {$seconds} seconds.",
        ]);
    }

    public function throttleKey(): string
    {
        return Str::lower($this->input('email')).'|'.$this->ip();
    }
}
