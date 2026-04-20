# LughaPro

**LughaPro** is a professional Kiswahili learning platform that connects students with expert tutors through a modern, scalable web application. It is designed for quality, credibility, and long-term extensibility — ready for AI, blockchain, and payment integrations.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, Lucide React, React Router v6 |
| Backend | Rust, Axum, tokio, sqlx, tracing, tower-http |
| Database | Neon PostgreSQL (via sqlx) |
| Future | Stellar Soroban (escrow), Groq AI (tutor assistant), JWT auth |

---

## Folder Structure

```
lughapro/
├── backend/                   # Rust/Axum API server
│   ├── src/
│   │   ├── config/            # Environment-based app configuration
│   │   ├── state/             # Shared application state (DB pool, config)
│   │   ├── routes/            # Route registration
│   │   ├── handlers/          # HTTP request handlers
│   │   ├── services/          # Business logic layer
│   │   ├── repositories/      # Database query layer
│   │   ├── models/            # Domain models (DB-mapped structs)
│   │   ├── schemas/           # Request/response DTOs
│   │   ├── middleware/        # Custom middleware (auth guards etc.)
│   │   ├── utils/             # Shared utility functions
│   │   ├── errors/            # Centralised error types
│   │   ├── modules/           # Feature modules (auth, users, tutors, ...)
│   │   └── main.rs            # Application entry point
│   ├── .env.example           # Environment variable template
│   └── Cargo.toml
│
└── frontend/                  # React/Vite client
    ├── src/
    │   ├── layouts/           # Page layout wrappers (MainLayout, DashboardLayout)
    │   ├── pages/             # Route-level page components
    │   ├── components/        # Reusable UI components
    │   ├── features/          # Feature-specific logic (future)
    │   ├── hooks/             # Custom React hooks (future)
    │   ├── services/          # API client (axios)
    │   ├── utils/             # Constants and helpers
    │   ├── routes.jsx         # Application route definitions
    │   ├── App.jsx            # Root component
    │   └── main.jsx           # Entry point
    ├── .env.example           # Frontend environment variable template
    └── package.json
```

---

## Getting Started

### Prerequisites

- **Rust** (stable, via [rustup](https://rustup.rs))
- **Node.js** 18+ and npm
- A **Neon PostgreSQL** database URL (or any PostgreSQL instance)

---

### 1. Clone the repository

```bash
git clone https://github.com/Alouzious/lughapro.git
cd lughapro
```

---

### 2. Configure environment variables

**Backend:**

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and fill in your DATABASE_URL, JWT_SECRET, etc.
```

**Frontend:**

```bash
cp frontend/.env.example frontend/.env
# Edit frontend/.env — set VITE_API_BASE_URL to your backend URL
```

---

### 3. Run the backend

```bash
cd backend
cargo run
```

The API will start on `http://localhost:8000` by default.

> **Note:** The server starts even without a database connection. The `/health` endpoint will always respond. If `DATABASE_URL` is not set, the `/health/db` endpoint will report `not_configured` rather than crashing.

---

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Server health check |
| GET | `/health/db` | Database connectivity status |

---

## What's Included in This MVP

### Core Platform
- **JWT authentication** — register, login, role-based access (student / tutor / admin)
- **Protected routes** — frontend route guards based on auth state and role
- **Role-aware navigation** — navbar and sidebar adapt per user role (student / tutor / admin)

### Profiles
- **Tutor profiles** — create, view, and update with hourly rate, bio, expertise, availability, photo URL, phone, location, teaching focus
- **Student profiles** — editable profiles with bio, learning goals, learning level, photo URL, phone, location
- **Tutor verification workflow** — states: `pending_review`, `verified`, `rejected`, `suspended`

### Bookings & Sessions
- **Bookings** — students book sessions with tutors; tutors confirm, complete, or cancel
- **Ratings** — students rate completed sessions (1–5 stars) with optional review text

### Payment System (Off-Chain Foundation)
- **Payment records** — each booking can have a payment record (amount, currency, status, reference ID)
- **Escrow-ready model** — payment fields: `funds_locked`, `ready_for_release`, `released`, `refund_pending`
- **Payment statuses** — `pending`, `paid`, `failed`, `refunded`
- Designed for future Stellar Soroban escrow integration without major refactoring

### Dispute System
- **Disputes** — student or tutor can raise a dispute linked to a booking
- **Dispute statuses** — `open`, `under_review`, `resolved`
- Admin can view and update dispute status

### Admin Management
- **Admin dashboard** — real-time platform stats (users, tutors, students, bookings, payments, disputes)
- **User management** — view all users filtered by role
- **Tutor management** — verify, reject, or suspend tutors
- **Bookings, payments, disputes** — full admin visibility

### Tutor Discovery
- Tutors can view fellow tutors on the platform via "Fellow Tutors" page

### Frontend
- **AuthContext** — React context for auth state, persisted to localStorage
- **Premium UI** — Tailwind CSS only, Lucide React icons, no emojis
- **Loading & empty states** — consistent across all pages
- **Modular services** — tutorService, bookingService, paymentService, disputeService, adminService, userService

---

## API Endpoints

| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| GET | `/health` | No | Server health check |
| GET | `/health/db` | No | Database connectivity status |
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive JWT token |
| GET | `/api/users/me` | Any | Get current user profile |
| PATCH | `/api/users/me` | Any | Update current user profile |
| GET | `/api/tutors` | No | List tutors (paginated) |
| POST | `/api/tutors/profile` | Tutor | Create tutor profile |
| GET | `/api/tutors/profile` | Tutor | Get own tutor profile |
| PATCH | `/api/tutors/profile` | Tutor | Update tutor profile |
| GET | `/api/tutors/:id/ratings` | No | Get ratings for a tutor |
| GET | `/api/tutors/:id/average-rating` | No | Get average rating for a tutor |
| POST | `/api/bookings` | Student | Create a booking |
| GET | `/api/bookings/me` | Any | Get own bookings |
| PATCH | `/api/bookings/:id/status` | Any | Update booking status |
| POST | `/api/ratings` | Student | Submit a rating for a completed session |
| POST | `/api/payments` | Any | Create a payment record for a booking |
| GET | `/api/payments/me` | Any | Get own payment records |
| GET | `/api/payments/booking/:id` | Any | Get payment for a specific booking |
| POST | `/api/disputes` | Any | Raise a dispute for a booking |
| GET | `/api/disputes/me` | Any | Get own disputes |
| PATCH | `/api/disputes/:id/status` | Admin | Update dispute status |
| GET | `/api/admin/stats` | Admin | Platform statistics |
| GET | `/api/admin/users` | Admin | List all users (paginated) |
| GET | `/api/admin/tutors` | Admin | List all tutors (paginated) |
| GET | `/api/admin/students` | Admin | List all students (paginated) |
| GET | `/api/admin/bookings` | Admin | List all bookings (paginated) |
| GET | `/api/admin/payments` | Admin | List all payments (paginated) |
| GET | `/api/admin/disputes` | Admin | List all disputes (paginated) |
| PATCH | `/api/admin/tutors/:id/verification` | Admin | Update tutor verification status |

---

## Database Migrations

| File | Description |
|------|-------------|
| `001_create_users.sql` | Users table |
| `002_create_tutor_profiles.sql` | Tutor profiles table |
| `003_create_bookings.sql` | Bookings table |
| `004_create_ratings.sql` | Ratings table |
| `005_extend_tutor_profiles.sql` | Add verification status, photo URL, phone, location, teaching focus |
| `006_extend_users.sql` | Add phone, location, photo URL, bio, learning goals, learning level |
| `007_create_payments.sql` | Payments table with escrow-ready fields |
| `008_create_disputes.sql` | Disputes table |

---

## Future Integrations

The codebase is structured for these future additions without major refactoring:

- **Stellar Soroban escrow** — payment model has `funds_locked`, `ready_for_release`, `released`, `refund_pending` fields ready
- **Groq AI tutor assistant** — `ai` module scaffold exists
- **Blockchain certificates** — `certificates` module scaffold exists
- **Token rewards** — `tokens` module scaffold exists

