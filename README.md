# Task Management System

A task/project management app: Express + Sequelize (PostgreSQL) backend, React + Vite + TypeScript frontend.

> **Note:** `client/` is a legacy Create-React-App frontend kept for reference. The active frontend is `frontend/` (Vite + shadcn/ui). New work should target `frontend/`.

## Quick start (Docker)

```bash
cp .env.example .env          # then set a strong JWT_SECRET
# generate one:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

docker compose up --build
```

- Frontend: http://localhost:3005
- Backend API: http://localhost:8005/api
- Health check: http://localhost:8005/health

## Local development

**Backend**
```bash
cd backend
cp .env.example .env          # fill in DB + JWT_SECRET
npm install
npm run migrate               # apply DB migrations
npm run seed                  # optional: create admin from ADMIN_EMAIL/ADMIN_PASSWORD
npm run dev                   # nodemon
npm test                      # requires a reachable Postgres (uses NODE_ENV=test)
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Configuration (backend/.env)

| Var | Purpose |
|-----|---------|
| `JWT_SECRET` | **Required.** ≥32 chars. App refuses to start in production with a weak/default value. |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`). |
| `DB_HOST/PORT/USER/PASSWORD/NAME/DIALECT` | Database connection. |
| `DB_SYNC` | `alter` (dev) / `safe` (create-missing) / `off` (migrations only — production). |
| `CORS_ORIGINS` | Comma-separated allowlist of browser origins. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Optional. Bootstraps an admin account via `npm run seed`. |

### Database migrations

Schema is managed by migrations (`backend/migrations/`), not `sync`. In production set `DB_SYNC=off`.

```bash
npm run migrate         # apply pending migrations
npm run migrate:undo    # roll back the last migration
npm run seed            # run seeders (admin bootstrap)
```

The Docker backend runs `migrate` (and `seed`) automatically before starting.

## Security hardening applied

- **Authorization on every resource** — tasks/projects/comments are scoped by ownership, project membership, and role (`backend/utils/access.js`). Cross-user access returns `403` (regression-tested in `backend/tests/authorization.test.js`).
- **Mass-assignment guards** — request bodies are field-whitelisted before hitting the ORM.
- **Input validation** — `express-validator` rules on auth/task/project/comment routes.
- **Secrets** — `.env` is untracked; startup fails fast on missing/weak `JWT_SECRET`.
- **Transport** — `helmet`, CORS allowlist, `trust proxy`, 1 MB body limit.
- **Rate limiting** — strict limiter on auth endpoints (brute-force defense) + general API limiter.
- **File uploads** — 5 MB limit, type allowlist, random server-side filenames (no path traversal); uploads require auth.
- **Reliability** — `/health` endpoint, fail-fast DB connect, graceful shutdown, transactions around multi-write task operations.
- **DB** — indexes on all foreign keys + hot columns; pagination on the task list.
- **Migrations** — `sequelize-cli` migrations (`backend/migrations/`); production runs with `DB_SYNC=off`. Optional admin bootstrap seeder.
- **Authenticated real-time** — Socket.io connections require a valid JWT and join a private per-user room; task assignments and comments push live notifications (toasts) to the assignee/participants.
- **Frontend** — routes are code-split via `React.lazy` (per-route chunks instead of one 550 KB bundle).
- **CI** — GitHub Actions runs backend tests (against Postgres) + migrations + frontend lint/build (`.github/workflows/ci.yml`).
- **Dependencies** — high-severity advisories resolved (`npm audit`).

## Known remaining work (not yet production-grade)

- **Token storage** — JWT lives in `localStorage` (XSS-exposed). Move to httpOnly cookies + CSRF, or add refresh/revocation. (Invasive; touches the whole auth flow.)
- **Horizontal scaling** — the rate limiter is in-memory *and* Socket.io has no shared adapter. Running multiple instances needs both a Redis rate-limit store **and** the Socket.io Redis adapter together.
- **Frontend cleanup** — add error boundaries; trim heavy deps (tsparticles/confetti); consolidate the legacy `client/` and active `frontend/`.
- **Observability** — replace `console.*` with structured logging (pino/winston) + metrics.
