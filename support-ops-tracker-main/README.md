# Support Operations Tracker & Handover System

An enterprise-grade operational tracking and shift handover platform built for Applications Support teams. The system enables personnel to define recurring operational checks, update activity statuses in real-time with remarks, attribute updates with personnel bio details and timestamps, coordinate smooth shift handovers of pending tasks, and generate custom historical audit reports.

---

## Local Development URLs
- Backend: `http://127.0.0.1:8000`
- Frontend: `http://localhost:5173`
- Frontend API base: defaults to `http://localhost:8000` unless `VITE_API_URL` is set in the environment

## Table of Contents

- [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Backend Setup (Laravel)](#1-backend-setup-laravel)
  - [Frontend Setup (React + Vite)](#2-frontend-setup-react--vite)
- [Default Team Credentials](#default-team-credentials)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Security & Authentication](#security--authentication)

---

## Key Features

1. **Activity Registry & Definition**
   - Register recurring operational checks and tracker activities (e.g., *"Daily SMS count in comparison to SMScount from logs"*, *"Payment Gateway Callback Reconciliation"*, *"Database Backup Verification"*).
   - Capture activity name, detailed operational instructions, creator personnel attribution, and active status.

2. **Daily Activity Status Updates & Remarks**
   - Update any activity to **`done`** or **`pending`**.
   - Input operational remarks, issue details, or handover notes for every check.
   - Record multiple chronological updates per activity throughout the day.

3. **Personnel Bio Details & Timestamp Tracking**
   - Automatically records the authenticated personnel's biographical details (**Name**, **Email**, and initials avatar) alongside the exact timestamp (`created_at`) when any status update is made.

4. **Daily View & Shift Handover Coordination**
   - Interactive calendar date picker to view operations for any calendar day.
   - **Handover Summary Banner**: Real-time counters for Total Tracked, Done Today, Pending Handover, and Not Yet Updated.
   - **Shift Handover Alert**: High-priority alert banner highlighting activities pending completion so outgoing and incoming personnel can coordinate seamlessly during shift transitions.
   - Filter tabs: *All Activities*, *Pending Handover*, and *Done*.
   - Direct inline update form on each activity card for immediate logging.

5. **Historical Reporting & Custom Duration Audits**
   - Query activity histories over custom date ranges (`From` and `To` dates).
   - Filter queries by specific activity or all activities.
   - Filter queries by status (`All`, `Done`, `Pending`).
   - Real-time KPI summary cards: Total Logged Records, Done Records, Pending Records, Unique Personnel Involved.
   - Detailed audit table with personnel bio info, remarks, statuses, and formatted timestamps.
   - **Export to CSV** feature for audit archiving and executive reporting.

---

## Architecture & Tech Stack

### Backend
- **Framework**: Laravel 11.x (PHP 8.2+)
- **Authentication**: Laravel Sanctum (Dual-layer: Stateful SPA Cookies + Personal Access Bearer Tokens)
- **Database**: SQLite 
- **Testing**: PHPUnit / Pest with RefreshDatabase

### Frontend
- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite, ESLint
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit & React Context API
- **Routing**: React Router v7
- **HTTP Client**: Axios with interceptors for Bearer tokens and error handling
- **Icons**: Lucide React

---

## Project Structure

```
support-ops-tracker/
├── backend/                              # Laravel API Application
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Api/
│   │   │   │   │   ├── ActivityController.php        # Activities CRUD API
│   │   │   │   │   └── ActivityUpdateController.php  # Daily log, updates & reports API
│   │   │   │   └── Auth/
│   │   │   │       └── AuthenticatedSessionController.php # Login & logout
│   │   │   └── Requests/Auth/LoginRequest.php        # Auth validation & rate limiting
│   │   ├── Models/
│   │   │   ├── Activity.php                          # Activity model
│   │   │   ├── ActivityUpdate.php                    # Activity update model
│   │   │   └── User.php                              # User model with Sanctum tokens
│   │   └── Rules/CompanyEmailDomain.php              # Enforces @npontu-support.com domain
│   ├── bootstrap/app.php                             # Middleware & stateful API configuration
│   ├── database/
│   │   ├── migrations/                               # Database migrations (activities, updates, users)
│   │   └── seeders/DatabaseSeeder.php                # Team personnel & sample activities seeder
│   ├── routes/
│   │   ├── api.php                                   # Authenticated API route definitions
│   │   └── web.php                                   # Auth session routes
│   └── tests/
│       └── Feature/
│           ├── ActivityTest.php                      # Activities, updates & reports tests
│           └── Auth/LoginTest.php                    # Login authentication tests
│
├── frontend/                             # React SPA Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── Activities.tsx            # Activity definition & registry UI
│   │   │   │   ├── AuthContext.tsx           # Auth state provider & session persistence
│   │   │   │   ├── DailyLog.tsx              # Daily log, handover banner & status updater
│   │   │   │   ├── Dashboard.tsx             # Overview dashboard & shift handover priority
│   │   │   │   ├── Profile.tsx               # User profile display
│   │   │   │   ├── Reports.tsx               # Custom date query & CSV exporter
│   │   │   │   ├── Settings.tsx              # Team and account settings UI
│   │   │   │   └── Sidebar.tsx               # Global navigation sidebar
│   │   │   ├── HomePage.tsx                  # Landing page matching dashboard styling
│   │   │   └── Login.tsx                     # Authentication UI
│   │   ├── redux/
│   │   │   ├── authSlice.ts                  # Redux auth state slice
│   │   │   └── store.ts                      # Redux store configuration
│   │   ├── Api.tsx                           # Axios client with token & error interceptors
│   │   ├── App.tsx                           # Main layout & auth protection guard
│   │   ├── main.tsx                          # React root & browser router
│   │   └── types.ts                          # TypeScript interfaces & models
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## Prerequisites

Ensure you have the following installed on your development environment:
- **PHP**: `>= 8.2` (PHP 8.5 recommended)
- **Composer**: `>= 2.x`
- **Node.js**: `>= 20.x`
- **Package Manager**: `pnpm` (or `npm`)
- **SQLite3**: Standard system library

---

## Installation & Setup

### 1. Backend Setup (Laravel)

Navigate into the `backend` directory:
```bash
cd backend
```

Install PHP dependencies:
```bash
composer install
```

Configure your environment file:
```bash
cp .env.example .env
php artisan key:generate
```

Run database migrations and seed the standard team members and sample activities:
```bash
php artisan migrate:fresh --seed
```

Start the backend development server:
```bash
php artisan serve
```
The API will be available at `http://127.0.0.1:8000`.

> The frontend defaults to `http://localhost:8000` for API requests unless you set a custom `VITE_API_URL` value.

---

### 2. Frontend Setup (React + Vite)

Open a new terminal and navigate into the `frontend` directory:
```bash
cd frontend
```

Install node dependencies:
```bash
pnpm install
# or: npm install
```

Start the frontend development server:
```bash
pnpm run dev
# or: npm run dev
```
The application will be accessible in your browser at `http://localhost:5173`.

---

## Default Team Credentials

The database seeder provisions support team accounts (restricted to `@npontu-support.com`):

| Name | Email Address | Password | Role |
| :--- | :--- | :--- | :--- |
| **Theo** | `theo@npontu-support.com` | `theo12` | Support Lead |
| **Kofi Owusu** | `kofi.owusu@npontu-support.com` | `password123` | Support Specialist |
| **Kinsley Kwakye** | `kinsley.kwakye@npontu-support.com` | `password123` | Systems Analyst |

---

## API Documentation

All operational endpoints under `/api/*` require authentication (Sanctum session cookie or `Authorization: Bearer <token>`).

### Authentication
- `POST /login`: Authenticate with email & password. Returns user object and `X-Auth-Token` header.
- `POST /logout`: Invalidate session and revoke active personal access tokens.
- `GET /api/user`: Retrieve the currently authenticated user.

### Activities
- `GET /api/activities`: List all active registered activities with creator information.
- `POST /api/activities`: Create a new recurring operational activity.
  - **Payload**:
    ```json
    {
      "name": "Daily SMS count ",
      "description": "SMS aggregation and table records"
    }
    ```

### Daily View & Status Updates
- `GET /api/daily-view?date=YYYY-MM-DD`: Fetch all registered activities and their updates for the specified date (defaults to current date).
- `POST /api/activities/{activity}/updates`: Record a status update and handover remark for an activity.
  - **Payload**:
    ```json
    {
      "status": "done",
      "remark": "Morning count: 12,380 SMS sent vs 12,380 logged. All queues normal.",
      "activity_date": "2026-09-09"
    }
    ```

### Reporting
- `GET /api/reports?from=YYYY-MM-DD&to=YYYY-MM-DD&activity_id={id}&status={done|pending}`: Query activity histories across a custom date range with optional activity and status filtering.

---

## Testing 

### Backend Automated Tests
Execute the complete PHPUnit test suite (including authentication tests, activity CRUD, status updating, personnel bio attribution, daily views, and report querying):
```bash
cd backend
php artisan test
```

---

## Security & Authentication

- **Company Domain Restriction**: The `CompanyEmailDomain` rule ensures only verified corporate email addresses (`@npontu-support.com`) can authenticate.
- **Brute Force Protection**: Rate limiting is enforced on login attempts (maximum 5 attempts per email + IP combination).
- **Dual-Layer SPA & API Auth**: Supports stateful session cookies (`EnsureFrontendRequestsAreStateful`) and Personal Access Tokens via `X-Auth-Token` header and Bearer token request authorization.
- **CSRF Protection**: Stateful web routes enforce CSRF token verification, while API endpoints authenticate securely via tokens and sessions without cross-origin friction.

---

