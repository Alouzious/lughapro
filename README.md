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

- **JWT authentication** — register, login, role-based access (student / tutor / admin)
- **Protected routes** — frontend route guards based on auth state and role
- **Tutor profiles** — create, view, and update tutor profiles with hourly rate, bio, expertise
- **Tutor listing** — live data from the API with pagination
- **Bookings** — students book sessions with tutors; tutors confirm, complete, or cancel
- **Ratings** — students rate completed sessions (1–5 stars) with optional review text
- **AuthContext** — React context for auth state, persisted to localStorage
- **Dashboard pages** — real-time data: student bookings, tutor session management
- **Backend scaffold** with layered architecture (config, state, routes, handlers, services, repositories, models, schemas, middleware, utils, errors)
- **Module placeholders** for future: payments, certificates, tokens, ai, blockchain, disputes
- **Frontend scaffold** with Tailwind CSS and Lucide React icons
- **Landing page**, Login, Register, Tutor Listing, Dashboards, Booking Form, Rating Form, Tutor Profile Page
- **Axios API client** with auth token interceptors
- **Database migrations** for users, tutor_profiles, bookings, ratings tables

---

## API Endpoints

| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| GET | `/health` | No | Server health check |
| GET | `/health/db` | No | Database connectivity status |
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive JWT token |
| GET | `/api/tutors` | No | List all tutors (paginated) |
| POST | `/api/tutors/profile` | Tutor | Create tutor profile |
| GET | `/api/tutors/profile` | Tutor | Get own tutor profile |
| PATCH | `/api/tutors/profile` | Tutor | Update tutor profile |
| GET | `/api/tutors/:id/ratings` | No | Get ratings for a tutor |
| GET | `/api/tutors/:id/average-rating` | No | Get average rating for a tutor |
| POST | `/api/bookings` | Student | Create a booking |
| GET | `/api/bookings/me` | Any | Get own bookings |
| PATCH | `/api/bookings/:id/status` | Any | Update booking status |
| POST | `/api/ratings` | Student | Submit a rating for a completed session |

