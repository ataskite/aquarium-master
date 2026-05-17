# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

水族大师 (Aquarium Master) — a WeChat Mini Program for aquarium management. Monorepo with pnpm workspaces containing a NestJS API backend and a Taro React frontend.

## Commands

```bash
# Install dependencies
corepack enable && corepack pnpm install

# Start infra (PostgreSQL on :5432, MinIO on :9000/:9001)
docker compose up -d postgres minio

# Database setup (after infra is running)
corepack pnpm prisma:generate
corepack pnpm prisma:migrate          # dev: creates migration
corepack pnpm --filter @aquarium/api prisma:migrate:deploy  # prod: applies migrations

# Development
corepack pnpm dev                     # all apps in parallel
corepack pnpm dev:api                 # NestJS API only (http://localhost:3000/api)
corepack pnpm dev:weapp               # Taro WeChat mini program (open apps/weapp in WeChat DevTools)
corepack pnpm dev:h5                  # Taro H5 preview (http://localhost:10086)

# Build
corepack pnpm build

# Type checking & linting (no separate test suite)
corepack pnpm typecheck
corepack pnpm lint
```

## Architecture

### Monorepo Layout

- `apps/api/` — NestJS + Prisma backend (`@aquarium/api`)
- `apps/weapp/` — Taro + React + NutUI frontend (`@aquarium/weapp`)
- `infra/Caddyfile` — Caddy reverse proxy config
- `docker-compose.yml` — PostgreSQL, MinIO, API, Caddy containers

### API (`apps/api`)

Standard NestJS modular structure. Global prefix `/api`, CORS enabled. Modules map 1:1 to domains:

- `prisma/` — shared PrismaService (replaces `@prisma/client` direct usage)
- `auth/` — WeChat login (`POST /api/auth/wechat-login`), mock mode returns `mock-openid-${code}`
- `users/` — user profile CRUD
- `aquariums/` — fish tank CRUD (core entity, owned by User)
- `water-quality/` — water parameter records, cascade-deleted with aquarium
- `maintenance/` — maintenance log entries, cascade-deleted with aquarium
- `ai/` — AI chat (`POST /api/ai/chat`), pluggable provider (`AI_PROVIDER` env)
- `storage/` — MinIO/S3 file upload via `@aws-sdk/client-s3`
- `reminders/` — user reminders with PENDING/DONE status
- `knowledge/` — read-only knowledge base articles

External service adapters are isolated in single files:
- WeChat: `apps/api/src/auth/wechat-openid.client.ts`
- AI: `apps/api/src/ai/ai.service.ts` (echo provider default, HTTP provider via env)
- Storage: `apps/api/src/storage/storage.service.ts` (S3-compatible, defaults to MinIO)

### Weapp (`apps/weapp`)

Taro 4 + React 18 + NutUI React Taro + Zustand for state. Runs as both WeChat mini program and H5.

- Pages: home, tank-detail, add-record, ai-assistant, reminders, profile
- `src/services/api.ts` — centralized API client using Taro.request, base URL from `TARO_APP_API_BASE_URL`
- `src/store/aquarium.ts` — Zustand store with demo data fallback when API unreachable

### Database (Prisma + PostgreSQL)

Models: User, Aquarium, WaterQualityRecord, MaintenanceRecord, Reminder, KnowledgeArticle, FileObject. Key relationships: Aquarium has cascading water/maintenance/reminders; User owns aquariums and reminders.

### Deployment

GitHub Actions SSH deploy on push to `main`/`master`. Server runs Docker Compose with multi-stage API Dockerfile. Secrets: `TENCENT_LIGHTHOUSE_HOST`, `TENCENT_LIGHTHOUSE_USER`, `TENCENT_LIGHTHOUSE_SSH_KEY`, `DEPLOY_PATH`.

## Environment

Copy `.env.example` to `.env`. Key variables:

- `DATABASE_URL` — PostgreSQL connection (default port 5432 to avoid conflicts)
- `MINIO_*` — MinIO/S3 config
- `WECHAT_APP_ID` / `WECHAT_APP_SECRET` — WeChat credentials (leave empty for mock mode)
- `AI_PROVIDER` — `echo` (default) or `http` with `AI_HTTP_ENDPOINT` / `AI_HTTP_API_KEY`
- `TARO_APP_API_BASE_URL` — API base URL for frontend (default `http://localhost:3000`)
