# Handoff

## State
Project running: frontend :5173, backend :3001, Postgres :5432. Semua distop.

## Next
Start: `docker compose up -d postgres` → `npm run dev`

## Context
3 fix wajib:
1. `api/lib/sentry.ts`: `import * as Sentry` (ESM)
2. `api/server.ts`: `import 'dotenv/config'` paling atas
3. `docker-compose.yml`: studio `20250102-0a8e98c`, port `8001:3000`
- `pnpm` tidak di PATH — pakai `npm run`
- `.env` `SUPABASE_URL` → Cloud (bukan localhost:8000)
