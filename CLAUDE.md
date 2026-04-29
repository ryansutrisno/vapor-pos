# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VaporPOS — multi-tenant POS system for vapor stores (devices, liquids, peripherals, recoil services). Indonesian market focus with Midtrans payment gateway, SendGrid email, Fonnte WhatsApp integration.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Radix UI + Zustand + React Router DOM
- **Backend**: Express.js + TypeScript (runs on port 3001, proxied via Vite `/api`)
- **Database/Auth**: Supabase (PostgreSQL 15) with RLS, local via Docker
- **Testing**: Vitest + jsdom + Testing Library React + Playwright (E2E)
- **Deployment**: Vercel (frontend, `vercel.json` rewrites `/api/*` to `/api/index`), Docker

## Commands

```bash
# Dev (concurrently: Vite frontend :5173 + Express backend :3001)
pnpm dev

# Frontend only
pnpm client:dev

# Backend only (nodemon + tsx)
pnpm server:dev

# Build + type check
pnpm build          # tsc -b && vite build
pnpm check          # tsc --noEmit only

# Lint + format
pnpm lint           # eslint .
pnpm format         # prettier --write .
pnpm format:check   # prettier --check .

# Tests
pnpm test           # vitest (unit)
pnpm test:ui        # vitest --ui
pnpm test:coverage  # vitest --coverage
pnpm test:e2e       # playwright

# Docker
pnpm docker:up      # docker compose up -d (Postgres + Supabase services)
pnpm docker:down
pnpm docker:restart
```

## Architecture

### High-Level Structure

```
vapor-pos/
├── src/                    # React frontend
│   ├── pages/              # Route-level page components
│   │   └── dashboard/      # Role-based dashboard sub-pages
│   ├── components/         # Shared UI components
│   ├── stores/             # Zustand stores (authStore, cartStore, cashStore)
│   ├── contexts/           # React contexts (Theme, Language, Store, Cash)
│   ├── lib/                # Supabase client, auth helpers, utilities
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Pure utilities (receipt generator, whatsapp)
│   ├── types/              # TypeScript type definitions
│   └── test/               # Test setup, mocks, factories
├── api/                    # Express.js backend
│   ├── routes/             # API route handlers (auth, admin, orders, trial, cron, audit)
│   ├── services/           # External service integrations (fonnte)
│   ├── lib/                # Backend utilities (supabase, email, logger, sentry, swagger)
│   └── app.ts              # Express app setup (middleware, routes, error handler)
├── supabase/migrations/    # SQL migrations (001–028 + helper scripts)
├── docker/supabase/        # Docker init-data.sql, kong.yml
├── scripts/                # Admin setup scripts
└── .trae/documents/        # Product requirements + technical architecture docs (Indonesian)
```

### Data Flow

1. **Frontend** talks to **Supabase directly** via `@/lib/supabase.ts` for most CRUD (products, stores, transactions, users)
2. **Express API** (`api/`) handles: auth (login/register with bcrypt + JWT), orders/payment (Midtrans), trial management, email (SendGrid), cron jobs, audit logs, WhatsApp receipts (Fonnte)
3. Vite dev proxy: `/api` → `http://localhost:3001` (see `vite.config.ts`)
4. Auth: dual-layer — Supabase Auth (session management) + Express local auth (login endpoint). User data in `users` table, session in Supabase localStorage

### Role-Based Access

Four roles: `superadmin` | `admin` | `warehouse` | `kasir`

- Dashboard routes are role-gated in `src/pages/Dashboard.tsx`
- Superadmin: `/dashboard/superadmin/*` (users, analytics, orders, settings, trial management, audit logs, invoices)
- Admin: `/dashboard/admin/*` (stores, staff, reports, settings)
- Warehouse: `/dashboard/warehouse/*` (products, categories, stock, reports)
- Kasir: `/dashboard/kasir/*` (transactions, customers, reports, cash sessions)

### Key DB Tables (from migrations 001–028)

- `users` — multi-tenant users with role, tenant_id, store_id, trial fields
- `stores` — store branches per tenant
- `products` — vapor products (device/liquid/peripheral/service)
- `transactions` / `transaction_items` — sales records
- `orders` — subscription orders (Midtrans)
- `customers` — customer profiles with phone-based tracking
- `categories` — product categories
- `stock_movements` — inventory transfers between stores
- `cash_sessions` — cashier shift/cash management
- `audit_logs` — audit trail
- `invoices` — invoice management
- `settings` / `tenant_settings` — global and per-tenant config

### State Management

- **Zustand** stores: `authStore` (persisted to localStorage), `cartStore` (POS cart), `cashStore` (cash session state)
- **React Context**: `ThemeContext` (light/dark), `LanguageContext` (EN/ID), `StoreContext` (active store selection), `CashProvider` (cash session)

## Development Workflow

### Local Setup

1. `pnpm install`
2. `cp .env.example .env` — fill in Supabase keys, Midtrans keys, SendGrid key
3. `pnpm docker:up` — starts PostgreSQL (:5432), Supabase Studio (:54323), Kong (:8000), GoTrue (:3100), PostgREST (:3000)
4. Run migrations in Supabase Studio SQL Editor (migrations auto-load via docker volume mount)
5. Run seed data from `docker/supabase/init-data.sql`
6. `pnpm dev` — frontend :5173, backend :3001

### Test Accounts (from seed data)

- Superadmin: `superadmin@vaporpos.com` / `demo123` (or `superadmin@test.com` / `test123`)
- Admin: `admin@test.com` / `test123`
- Warehouse: `warehouse@test.com` / `test123`
- Kasir: `kasir@test.com` / `test123`

### Trial Registration Flow

1. User registers at `/register` → POST `/api/auth/register-trial`
2. Email verification sent via SendGrid → click link → POST `/api/auth/verify-email`
3. Trial starts (14 days), `trial_started_at` / `trial_expires_at` set
4. Auto-suspend via cron: `POST /api/cron/check-trial-expiration`

### Payment Flow

1. User fills order form at `/order` → POST `/api/orders`
2. Midtrans Snap payment (sandbox mode for dev)
3. Webhook at POST `/api/orders/webhook` updates payment status
4. Superadmin approves → tenant account created

### CI/CD (`.github/workflows/ci.yml`)

- Node 20, pnpm 9
- Steps: lint → check → test → format:check → build → docker push (main only)

## Important Patterns

- **Path alias**: `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- **Backend uses ES modules**: `"type": "module"` in `package.json`, imports use `.js` extensions
- **Backend entry**: `api/server.ts` (dev), `api/index.ts` (Vercel serverless)
- **Zustand persist**: auth state persisted to `vapor-pos-auth` localStorage key
- **Supabase client**: single export from `src/lib/supabase.ts`, used throughout frontend
- **Tailwind**: CSS variables in `index.css` for theming (light/dark via `.dark` class)
- **No existing Cursor/Copilot rules** in the repository
