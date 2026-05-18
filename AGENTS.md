# Repository Guidelines

Keep this file synchronized with `README.md` and `CLAUDE.md` whenever repository structure, commands, verification gates, or deployment assumptions change.

## Project Structure & Module Organization

This is a pnpm workspace for the Aquarium Master demo. `apps/api` contains the NestJS 11 API service, with domain modules under `apps/api/src`, Prisma schema and migrations under `apps/api/prisma`, and the production `Dockerfile`. `apps/weapp` contains the Taro 4 + React 18 mini program, with pages in `apps/weapp/src/pages`, shared API access in `apps/weapp/src/services`, Zustand state in `apps/weapp/src/store`, and Taro config in `apps/weapp/config`.

Shared repository files live at the root: `docker-compose.yml`, `tsconfig.base.json`, `pnpm-workspace.yaml`, `.env.example`, `infra/Caddyfile`, and `prototype.png`. `docker-compose.yml` starts PostgreSQL 18, MinIO, the API service, and Caddy.

## Build, Test, and Development Commands

Use Corepack with the pinned package manager:

```bash
corepack enable
corepack pnpm install
corepack pnpm docker:up
corepack pnpm prisma:generate
corepack pnpm prisma:migrate
corepack pnpm dev
```

`corepack pnpm dev:api` starts the API at `http://localhost:3000/api`. `corepack pnpm dev:weapp` builds the WeChat mini program for DevTools. `corepack pnpm dev:h5` starts the H5 preview at `http://localhost:10086`.

Before handing off changes, run:

```bash
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
```

Use `corepack pnpm build:h5` when H5 output is part of the change. For production database deployment, use `corepack pnpm --filter @aquarium/api prisma:migrate:deploy`.

## Coding Style & Naming Conventions

Write TypeScript throughout. Follow the existing NestJS naming pattern: `*.module.ts`, `*.controller.ts`, `*.service.ts`, and keep external adapters isolated, such as `wechat-openid.client.ts`, `ai.service.ts`, and `storage.service.ts`.

Taro pages use `index.tsx`, `index.config.ts`, and optional `index.scss` inside each page directory. Prefer explicit DTO-like request handling, clear async error paths, and centralized API calls through `apps/weapp/src/services/api.ts`. Shared aquarium state and demo fallback belong in `apps/weapp/src/store/aquarium.ts`.

## Testing Guidelines

There is currently no dedicated unit-test script or test framework configured. Treat `corepack pnpm typecheck`, `corepack pnpm lint`, and relevant builds as the minimum verification gate. For API schema changes, run Prisma generation/migration when appropriate. For UI changes, verify `dev:weapp`; when practical, also verify `dev:h5` for browser preview.

## Environment & External Services

Copy `.env.example` to `.env` for local development and do not commit secrets. Leave WeChat credentials empty for mock login mode. The default AI provider is `echo`, which keeps local demos free of external model dependencies; use `AI_PROVIDER=http` with `AI_HTTP_ENDPOINT` and `AI_HTTP_API_KEY` to connect a real provider.

MinIO is S3-compatible storage for uploads. Ensure the configured bucket exists before testing uploads. Keep MinIO, PostgreSQL, AI provider, WeChat credentials, and public API endpoint changes documented in the PR or handoff.

## Commit & Pull Request Guidelines

Use a conservative commit convention: short imperative subject lines, optionally scoped, for example `api: add reminder filtering` or `weapp: refine tank detail layout`. Pull requests should describe the user-facing change, list verification commands run, call out schema or environment changes, and include screenshots for visible mini-program or H5 UI changes.

## Agent-Specific Instructions

When inspecting third-party Java jar sources, do not use `javap` decompilation first. Prefer Maven source jars already present under `~/.m2/repository`, for example `.../agentscope-1.0.11-sources.jar!/io/agentscope/core/agent/AgentBase.java`.
