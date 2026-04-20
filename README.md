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

- **Backend scaffold** with layered architecture (config, state, routes, handlers, services, repositories, models, schemas, middleware, utils, errors)
- **Module placeholders** for: auth, users, tutors, bookings, payments, ratings, certificates, tokens, ai, blockchain, disputes
- **Frontend scaffold** with Tailwind CSS and Lucide React icons
- **Landing page** — professional hero, feature cards, stats, and CTA
- **Login page** — clean form with icon inputs
- **Register page** — role selector (Student / Tutor) + form
- **Tutor listing page** — searchable tutor cards with ratings
- **Student dashboard shell** — stats cards and session list
- **Tutor dashboard shell** — earnings, session, and rating stats
- **Admin dashboard shell** — platform overview with alert indicators
- **Responsive navbar** with mobile menu
- **Sidebar dashboard layout** with navigation links
- **Axios API client** with auth token interceptors
- **Environment configuration** for both frontend and backend
- **Secure gitignore** — `.env` files are never committed

---

## Planned Future Modules

| Module | Description |
|--------|-------------|
| Auth | JWT login, registration, role-based access control |
| Users | Profile management, avatar upload |
| Tutors | Tutor onboarding, profile verification, availability |
| Bookings | Session scheduling, confirmation, cancellation |
| Payments | Stellar Soroban escrow, custodial wallets, refunds |
| Ratings | Post-session reviews and reputation scores |
| Certificates | Blockchain-verified completion certificates |
| Tokens | LughaPro token rewards and redemption |
| AI | Groq-powered AI tutor assistant |
| Blockchain | Stellar Soroban smart contract integration |
| Disputes | Session dispute resolution and admin mediation |

---

## Development Notes

- The backend does **not** panic if `DATABASE_URL` is missing — it logs a warning and starts without a DB connection. This makes local development and health checks possible without a database.
- All secrets must be placed in `.env` files which are gitignored. Never commit real credentials.
- The frontend uses the `VITE_` prefix for all environment variables as required by Vite.
