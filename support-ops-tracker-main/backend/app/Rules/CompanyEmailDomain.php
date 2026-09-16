<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Restricts a field to email addresses on the applications-support
 * team's company domain. It does not allow public registration — accounts
 * and it is applied consistently everywhere an email is accepted
 */
class CompanyEmailDomain implements ValidationRule
{
    protected string $allowedDomain = 'npontu-support.com';

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! str_contains($value, '@')) {
            $fail('Please enter a valid email address.');

            return;
        }

        $domain = strtolower(substr(strrchr($value, '@'), 1));

        if ($domain !== $this->allowedDomain) {
            $fail("Access is restricted to @{$this->allowedDomain} company accounts.");
        }
    }
}
