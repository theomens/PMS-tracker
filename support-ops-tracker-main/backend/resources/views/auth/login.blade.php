<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sign in · Relay</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root{
            --ink:#1B2430; --paper:#F7F5F0; --paper-line:#E3DFD3;
            --graphite:#2B303A; --slate:#6B7280; --amber:#D98E2B; --rust:#BD4F35; --rust-soft:#F5E1DB;
        }
        *{box-sizing:border-box;}
        html,body{margin:0;height:100%;font-family:'Space Grotesk',sans-serif;color:var(--graphite);}
        body{
            display:flex;align-items:center;justify-content:center;padding:40px 20px;
            background:radial-gradient(circle at 15% 20%, #263041 0%, transparent 45%), var(--ink);
        }
        .login-card{width:380px;max-width:100%;background:var(--paper);border-radius:4px;padding:38px 34px 32px;box-shadow:0 30px 60px -20px rgba(0,0,0,.5);}
        .brand{display:flex;align-items:center;gap:10px;margin-bottom:28px;}
        .brand-name{font-weight:700;font-size:20px;letter-spacing:-.01em;}
        .brand-sub{font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--slate);margin-top:1px;}
        h1{font-size:16px;font-weight:600;margin:0 0 4px;}
        p.hint{font-size:13px;color:var(--slate);margin:0 0 22px;line-height:1.5;}
        .alert-error{background:var(--rust-soft);color:var(--rust);border-radius:3px;padding:10px 12px;font-size:12.5px;margin-bottom:18px;}
        .field{margin-bottom:16px;}
        .field label{display:block;font-size:11.5px;color:var(--slate);margin-bottom:6px;font-family:'IBM Plex Mono',monospace;}
        .field input{width:100%;padding:11px 12px;border:1px solid var(--paper-line);border-radius:2px;background:#fff;font-family:'Space Grotesk',sans-serif;font-size:14px;}
        .field input:focus{outline:2px solid var(--amber);outline-offset:1px;border-color:var(--amber);}
        .remember{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--slate);margin-bottom:14px;}
        .btn-primary{width:100%;padding:12px;border:none;border-radius:2px;background:var(--amber);color:#1B2430;font-weight:700;font-size:14px;cursor:pointer;font-family:'Space Grotesk',sans-serif;}
        .btn-primary:hover{background:#c67f22;}
        .login-foot{margin-top:22px;padding-top:18px;border-top:1px solid var(--paper-line);font-size:12px;color:var(--slate);text-align:center;}
    </style>
</head>
<body>
    <div class="login-card">
        <div class="brand">
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <circle cx="17" cy="17" r="16" stroke="#D98E2B" stroke-width="2"/>
                <path d="M10 20L16 12L20 17L24 12" stroke="#D98E2B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="24" cy="12" r="2.2" fill="#D98E2B"/>
            </svg>
            <div>
                <div class="brand-name">Relay</div>
                <div class="brand-sub">SUPPORT ACTIVITY LOG</div>
            </div>
        </div>

        <h1>Sign in to your shift</h1>
        <p class="hint">Use your @npontu-support.com account. Access is logged against every update you make today.</p>

        @if ($errors->any())
            <div class="alert-error">{{ $errors->first() }}</div>
        @endif

        <form method="POST" action="{{ route('login') }}">
            @csrf

            <div class="field">
                <label for="email">STAFF EMAIL</label>
                <input id="email" type="email" name="email" value="{{ old('email') }}"
                       placeholder="name@npontu-support.com" required autofocus autocomplete="username">
            </div>

            <div class="field">
                <label for="password">PASSWORD</label>
                <input id="password" type="password" name="password"
                       placeholder="••••••••••" required autocomplete="current-password">
            </div>

            <label class="remember">
                <input type="checkbox" name="remember"> Keep me signed in on this device
            </label>

            <button type="submit" class="btn-primary">Sign in →</button>
        </form>

        <div class="login-foot">v1.0 · Applications Support</div>
    </div>
</body>
</html>
