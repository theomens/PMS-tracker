<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', '*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://support-ops-tracker.vercel.app',
        'https://support-ops-tracker.vercel.app',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [
        '#^http://(localhost|127\.0\.0\.1)(:\d+)?$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['X-Auth-Token'],

    'max_age' => 0,

    'supports_credentials' => true,

];
