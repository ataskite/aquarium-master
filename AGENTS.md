# Repository Guidelines

## Project Structure & Module Organization

This is a pnpm workspace for the Aquarium Master demo. `apps/api` contains the NestJS 11 API service, with domain modules under `apps/api/src`, Prisma schema and migrations under `apps/api/prisma`, and the production `Dockerfile`. `apps/weapp` contains the Taro 4 + React 18 mini program, with pages in `apps/weapp/src/pages`, shared API access in `apps/weapp/src/services`, Zustand state in `apps/weapp/src/store`, and Taro config in `apps/weapp/config`. Shared repository files live at the root: `docker-compose.yml`, `tsconfig.base.json`, `pnpm-workspace.yaml`, `.env.example`, and `prototype.png`.

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

`corepack pnpm dev:api` starts the API at `http://localhost:3000/api`. `corepack pnpm dev:weapp` builds the WeChat mini program for DevTools. `corepack pnpm dev:h5` starts the H5 preview at `http://localhost:10086`. Run `corepack pnpm build`, `corepack pnpm typecheck`, and `corepack pnpm lint` before handing off changes.

## Coding Style & Naming Conventions

Write TypeScript throughout. Follow the existing NestJS naming pattern: `*.module.ts`, `*.controller.ts`, `*.service.ts`, and keep external adapters isolated, such as `wechat-openid.client.ts`. Taro pages use `index.tsx`, `index.config.ts`, and optional `index.scss` inside each page directory. Prefer explicit DTO-like request handling, clear async error paths, and centralized API calls through `apps/weapp/src/services/api.ts`.

## Testing Guidelines

There is currently no dedicated unit-test script or test framework configured. Treat `corepack pnpm typecheck`, `corepack pnpm lint`, and relevant builds as the minimum verification gate. For API changes, run Prisma generation/migration when schema changes are involved. For UI changes, verify both `dev:weapp` and, when practical, `dev:h5`.

## Commit & Pull Request Guidelines

Git history currently has a single initial commit, so use a conservative convention: short imperative subject lines, optionally scoped, for example `api: add reminder filtering` or `weapp: refine tank detail layout`. Pull requests should describe the user-facing change, list verification commands run, call out schema or environment changes, and include screenshots for visible mini-program or H5 UI changes.

## Security & Configuration Tips

Copy `.env.example` to `.env` for local development and do not commit secrets. Leave WeChat credentials empty for mock login mode. Keep MinIO, PostgreSQL, AI provider, and public API endpoint changes documented in the PR.

## Agent-Specific Instructions

When inspecting third-party Java jar sources, do not use `javap` decompilation first. Prefer Maven source jars already present under `~/.m2/repository`, for example `.../agentscope-1.0.11-sources.jar!/io/agentscope/core/agent/AgentBase.java`.
