# Local Development with Docker Supabase

This project includes a complete local Supabase stack for development without depending on Supabase Cloud.

## Quick Start

```bash
# Start Supabase stack
docker compose up -d

# Wait for services to be ready
sleep 10

# Check status
docker compose ps
```

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Supabase Studio | http://localhost:8000 | Database UI (like Supabase Dashboard) |
| PostgREST API | http://localhost:3000 | Auto-generated REST API |
| GoTrue Auth | http://localhost:3100 | Authentication API |
| Backend API | http://localhost:3001 | VaporPOS Express API |
| Frontend | http://localhost:5173 | VaporPOS React App |
| PostgreSQL | localhost:5432 | Direct database connection |

## Default Credentials

- **PostgreSQL**: `postgres` / `postgres`
- **Supabase Studio**: No auth required (local)

## Test Accounts

After starting Docker, run migrations and test data will be seeded:

| Email | Role | Password |
|-------|------|----------|
| superadmin@test.com | superadmin | test123 |
| admin@test.com | admin | test123 |
| warehouse@test.com | warehouse | test123 |
| kasir@test.com | kasir | test123 |

## Database Migrations

Migrations are automatically applied from `supabase/migrations/` on first startup.

## Stop Services

```bash
# Stop but keep data
docker compose stop

# Stop and remove data
docker compose down -v
```

## Environment Variables

Copy `.env.local` to `.env` for local development:

```bash
cp .env.example .env
```

Key variables:
- `VITE_SUPABASE_URL=http://localhost:8000`
- `SUPABASE_SERVICE_ROLE_KEY=...` (for backend)

## Testing

```bash
# Run unit tests
pnpm test

# Run E2E tests (requires running services)
pnpm test:e2e

# Run tests with UI
pnpm test:ui
```

## Troubleshooting

### Port already in use
```bash
# Check what's using the port
lsof -i :5432

# Kill the process
kill <PID>
```

### Database connection failed
```bash
# Check postgres logs
docker compose logs postgres

# Restart postgres
docker compose restart postgres
```

### Reset everything
```bash
docker compose down -v
docker compose up -d
```
