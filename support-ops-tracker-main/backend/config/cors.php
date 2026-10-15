<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', '*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://https://pms-tracker-neon.vercel.app',
    ],

    'allowed_origins_patterns' => [
        '#^http://(localhost|127\.0\.0\.1)(:\d+)?$#',
        '#^https://([a-z0-9-]+\.)*vercel\.app$#i',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['X-Auth-Token'],

    'max_age' => 0,

    'supports_credentials' => true,

];
