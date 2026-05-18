# CLAUDE.md

This file gives Claude Code the current working context for this repository. Keep it synchronized with `README.md` and `AGENTS.md` whenever project structure, scripts, verification gates, or deployment assumptions change.

## Project Overview

水族大师 (Aquarium Master) is a WeChat Mini Program demo for aquarium management. The repo is a pnpm workspace:

- `apps/api` — NestJS 11 + Prisma API service.
- `apps/weapp` — Taro 4 + React 18 mini program, also runnable as H5.
- Root files — shared Docker Compose, TypeScript config, pnpm workspace config, `.env.example`, Caddy config, and `prototype.png`.

The app covers aquarium profiles, water-quality records, maintenance logs, reminders, knowledge-base articles, image upload through MinIO/S3, and AI chat. The default AI provider is `echo` so the demo can run without external model services.

## Commands

Use Corepack with the pinned package manager (`pnpm@11.1.2`):

```bash
corepack enable
corepack pnpm install
```

Local dependencies:

```bash
corepack pnpm docker:up
# equivalent: docker compose up -d postgres minio
```

Database:

```bash
corepack pnpm prisma:generate
corepack pnpm prisma:migrate
corepack pnpm --filter @aquarium/api prisma:migrate:deploy
```

Development:

```bash
corepack pnpm dev        # API + frontend watch tasks
corepack pnpm dev:api    # http://localhost:3000/api
corepack pnpm dev:weapp  # WeChat mini program build/watch
corepack pnpm dev:h5     # http://localhost:10086
```

Verification and builds:

```bash
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
corepack pnpm build:h5
```

There is no dedicated unit-test script currently configured. Treat `typecheck`, `lint`, and relevant builds as the minimum handoff gate.

## Architecture

### API (`apps/api`)

The API uses standard NestJS modules with global `/api` prefix and Prisma for PostgreSQL access. Keep domain logic in modules under `apps/api/src`, and keep external adapters isolated.

- `auth` — WeChat login at `POST /api/auth/wechat-login`; empty WeChat credentials return `mock-openid-${code}`.
- `users` — user profile read/update.
- `aquariums` — aquarium CRUD and detail aggregation.
- `water-quality` — water parameter records.
- `maintenance` — maintenance log records.
- `reminders` — reminder CRUD with pending/done status.
- `knowledge` — read-only knowledge-base articles.
- `ai` — AI chat with `echo` and HTTP provider options.
- `storage` — MinIO/S3-compatible upload.
- `prisma` — shared Prisma service.

Important adapters:

- WeChat: `apps/api/src/auth/wechat-openid.client.ts`
- AI: `apps/api/src/ai/ai.service.ts`
- Storage: `apps/api/src/storage/storage.service.ts`

### Weapp (`apps/weapp`)

The frontend uses Taro 4, React 18, NutUI React Taro, TypeScript, and Zustand.

- Pages live under `apps/weapp/src/pages`.
- Centralized API calls live in `apps/weapp/src/services/api.ts`.
- Shared aquarium state and demo fallback live in `apps/weapp/src/store/aquarium.ts`.
- Taro config lives in `apps/weapp/config`.

Use `index.tsx`, `index.config.ts`, and optional `index.scss` inside each page directory.

### Data and Infra

Core Prisma models: `User`, `Aquarium`, `WaterQualityRecord`, `MaintenanceRecord`, `Reminder`, `KnowledgeArticle`, and `FileObject`.

`docker-compose.yml` starts PostgreSQL 18, MinIO, the API container, and Caddy. Caddy reads `infra/Caddyfile` and proxies `/api/*` to the API service.

## Environment

Copy `.env.example` to `.env`.

Key variables:

- `API_PORT` — API port, default `3000`.
- `WEB_APP_ORIGIN` — allowed CORS origins, default `http://localhost:10086`.
- `DATABASE_URL` / `POSTGRES_*` — PostgreSQL connection settings.
- `MINIO_*` — MinIO/S3-compatible storage settings.
- `WECHAT_APP_ID` / `WECHAT_APP_SECRET` — leave empty for mock login.
- `AI_PROVIDER` — `echo` or `http`; HTTP mode also needs `AI_HTTP_ENDPOINT` and optionally `AI_HTTP_API_KEY`.
- `TARO_APP_API_BASE_URL` — frontend API origin, default `http://localhost:3000`.

## Working Rules

- Prefer TypeScript and existing repo patterns.
- API files follow NestJS names such as `*.module.ts`, `*.controller.ts`, and `*.service.ts`.
- Frontend API access should stay centralized in `apps/weapp/src/services/api.ts`.
- For schema changes, update Prisma schema/migrations and run Prisma generation/migration as appropriate.
- For visible UI changes, verify `dev:weapp`; when practical, also check `dev:h5` for quick browser feedback.
- Do not commit secrets. Keep `.env.example` as the documented contract.
- When inspecting third-party Java jar sources, do not use `javap` decompilation first. Prefer Maven source jars already present under `~/.m2/repository`, for example `.../agentscope-1.0.11-sources.jar!/io/agentscope/core/agent/AgentBase.java`.
