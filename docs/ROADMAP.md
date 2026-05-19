# Aquarium Master Roadmap

Last reviewed: 2026-05-19

## Progress Tracker

| Milestone | Status | Last Updated | Notes |
|---|---|---|---|
| v0.2 Real User and Aquarium Management | **Done** | 2026-05-19 | JWT auth, user isolation, aquarium CRUD, fish stock CRUD, device CRUD. All 150 tests green. |
| v0.3 Record Intelligence | Not started | — | |
| v0.4 Smart Care Plan | Not started | — | |
| v0.5 Context-Aware AI Diagnosis | Not started | — | |
| v0.6 Knowledge and Species Library | Not started | — | |
| v0.7 Production Readiness | Not started | — | |

### v0.2 Completion Detail

- Auth: JWT signing, global JwtAuthGuard, @Public() decorator, @CurrentUser() decorator, mock WeChat login.
- User isolation: all queries scoped by userId, Aquarium.userId NOT NULL, 401 on unauthenticated requests.
- Aquarium CRUD: create/edit/delete pages, DTO validation, ownership checks.
- Fish stock: species search API, add/edit/delete with species library or custom input.
- Device management: type-based CRUD, status indicators, conditional fields (flow rate).
- Seed data: demo user (mock-openid-demo) owns all seed aquariums/data.
- Tests: 51 API integration tests (8 files), 99 weapp unit tests (5 files).
- Missing tests: fish-stocks, fish-species, devices API tests; frontend page tests.

This roadmap describes how to evolve Aquarium Master from a realistic local demo into a durable WeChat Mini Program for aquarium care. Keep visible product affordances tied to real data and real actions: if a feature is not backed by a model, API, or workflow, rename it, hide it, or build the backing capability first.

## Current State

Aquarium Master is already beyond a static prototype. It is a pnpm workspace with a NestJS + Prisma API in `apps/api` and a Taro + React mini program in `apps/weapp`.

The current app supports:

- Aquarium dashboard, aquarium detail pages, fish stock display, device display, water profile display, and health summary.
- Water-quality records, feeding records, water-change records, maintenance records, and reminder CRUD backed by the API.
- Realistic seeded aquarium data through `database/init-db.sql` and `reset-db.sh`, including multiple aquarium types, fish species, stocks, devices, water profiles, feeding templates, records, reminders, and knowledge articles.
- AI chat through a default `echo` provider or a configurable HTTP provider.
- File upload plumbing through MinIO/S3-compatible storage.
- Weapp utility/store tests and API e2e-style tests.

Verification snapshot from this review:

- `corepack pnpm typecheck` passed.
- `corepack pnpm test:weapp` passed: 5 test files, 99 tests.
- `corepack pnpm test:run` did not complete because API tests require PostgreSQL at `localhost:5432`, and the database was not running.

## Product Direction

The product should become a daily aquarium care assistant, not a generic record notebook. The core loop is:

1. Maintain accurate aquarium, fish, device, and water-profile data.
2. Record water tests, feeding, maintenance, and observed issues with minimal friction.
3. Convert those records into reminders, trends, warnings, and AI-assisted diagnosis.
4. Help the user act correctly today and understand long-term aquarium stability.

## Guiding Principles

- Real data first: prefer schema, seed, API, and UI changes that make features database-backed.
- Truthful UI: every button, tab, and page should either work now or be removed from the visible workflow.
- Care workflow over feature count: prioritize repeated tasks such as testing water, feeding, water changes, device checks, and reminders.
- Contextual intelligence: AI answers should use the user's aquarium context, not only free-form chat text.
- Local demo remains easy: keep the default `echo` AI provider and seed reset flow so the project can still be demonstrated without paid external services.

## Milestones

### v0.2 Real User and Aquarium Management

Goal: make the app usable by one real owner managing their own aquariums.

Scope:

- Replace demo token behavior with a real session/auth boundary suitable for mini-program usage.
- Enforce user scoping on aquarium, reminder, record, and profile queries.
- Add create/edit flows for aquariums.
- Add fish stock management: add species, update quantity, remove stock, and show source/care metadata.
- Add device management: create/update/delete filters, lights, heaters, air pumps, CO2, and notes.
- Wire maintenance images through the existing upload API.

Acceptance criteria:

- A logged-in user only sees their own aquariums and records.
- A user can create a new aquarium without editing seed SQL.
- Fish and device edits persist through the API and survive reload.
- Maintenance records can include an uploaded image URL.

### v0.3 Record Intelligence

Goal: make records useful after they are saved.

Scope:

- Add water-quality trend charts for temperature, pH, ammonia, nitrite, nitrate, and TDS.
- Compare latest water values against each aquarium's target `WaterParameterProfile`.
- Introduce explicit warning levels: normal, watch, action needed.
- Replace static health score usage with a documented calculation based on water profile, overdue reminders, recent maintenance, and stocking context.
- Add record editing and deletion where the backend already supports it.

Acceptance criteria:

- Tank detail shows at least 7-day and 30-day water trends.
- Out-of-range water values produce clear warnings and suggested next steps.
- Health score is reproducible from stored data rather than treated as a purely manual field.

### v0.4 Smart Care Plan

Goal: turn reminders into a living care schedule.

Scope:

- Add care plan templates by aquarium style: planted community, livebearer, betta, goldfish, shrimp, cichlid, and nano planted.
- Generate reminders from fish stock, water profile, device setup, and recent records.
- Support repeat rules beyond free-form strings: daily, weekly, monthly, custom interval, and one-off.
- Add overdue and snooze flows.
- Add "complete with record" actions, such as completing a water-change reminder by creating a maintenance record.

Acceptance criteria:

- Reset seed data can create realistic default care plans.
- New aquariums can receive generated starter reminders.
- Completing a reminder can optionally create the related maintenance record.

### v0.5 Context-Aware AI Diagnosis

Goal: make AI a practical aquarium triage assistant.

Scope:

- Add a backend diagnosis endpoint that assembles aquarium context before calling the AI provider.
- Include fish stock, target water profile, latest water records, recent maintenance, active reminders, and knowledge snippets in the prompt.
- Return structured diagnosis: likely causes, immediate actions, risk level, observation window, and when to isolate fish or change water.
- Store diagnosis sessions when the user chooses to keep them.
- Make AI starter prompts aquarium-specific instead of generic.

Acceptance criteria:

- AI advice changes based on the selected aquarium's real data.
- The response separates urgent actions from longer-term adjustments.
- The app can run in local `echo` mode and external HTTP mode without code changes.

### v0.6 Knowledge and Species Library

Goal: make the seeded knowledge base a real product surface.

Scope:

- Add searchable species library pages from `FishSpecies`.
- Link species pages to stock entries and aquarium compatibility guidance.
- Expand `KnowledgeArticle` categories: water quality, cycling, diseases, feeding, equipment, plants, shrimp, cichlids, and emergency handling.
- Let AI cite or reference knowledge articles used for an answer.
- Add admin/seed workflow for adding high-quality species and article data.

Acceptance criteria:

- Users can search fish species and view care ranges before adding stock.
- Knowledge articles can be opened from AI advice or warning states.
- Seed data remains internally consistent and reproducible.

### v0.7 Production Readiness

Goal: make the app ready for external users and mini-program review.

Scope:

- Finalize environment contracts for production API, Caddy, PostgreSQL, MinIO, and WeChat credentials.
- Add database backup and restore documentation.
- Add observability: request logs, error logs, and basic health endpoints.
- Add safer API validation through DTOs and explicit error responses.
- Add deployment checklist and mini-program review checklist.

Acceptance criteria:

- A fresh deployment can be brought up from documented steps.
- API rejects invalid payloads with clear errors.
- The team can inspect failures without attaching a debugger.

## Engineering Backbone

These workstreams should run alongside product milestones:

- API boundaries: move repeated controller logic into services, add DTO validation, and avoid accepting unrestricted `Record<string, unknown>` payloads for long-lived endpoints.
- Test reliability: provide a one-command local test database path so API tests do not silently depend on an already-running PostgreSQL instance.
- Frontend state: keep API access centralized in `apps/weapp/src/services/api.ts` and shared aquarium state in `apps/weapp/src/store/aquarium.ts`.
- Data integrity: keep Prisma schema, migrations, seed SQL, reset scripts, and UI assumptions in sync.
- Handoff quality: before handoff, run `corepack pnpm typecheck`, `corepack pnpm lint`, relevant tests, and relevant builds or H5/weapp previews.

## Suggested Iteration Cadence

Use two-week iterations with one primary outcome per slice:

- Iteration 1: v0.2 auth and user-scoped aquarium management.
- Iteration 2: v0.2 fish stock and device management.
- Iteration 3: v0.3 water trends and warning levels.
- Iteration 4: v0.3 health score rules and record editing.
- Iteration 5: v0.4 generated care plans and reminder completion flows.
- Iteration 6: v0.5 context-aware AI diagnosis.
- Iteration 7: v0.6 species library and knowledge linking.
- Iteration 8: v0.7 production readiness.

## Near-Term Backlog

Highest priority:

- Add user scoping and real session handling.
- Add aquarium create/edit UI and API validation.
- Add fish stock CRUD and device CRUD.
- Add water trend utilities and chart UI.
- Add API test database bootstrap.

Medium priority:

- Add reminder repeat-rule structure.
- Add "complete reminder with record" flow.
- Add AI diagnosis endpoint with selected aquarium context.
- Add species search and species detail pages.
- Add maintenance image upload from the weapp.

Later:

- Knowledge article editor or import workflow.
- Care plan templates by aquarium type.
- Production logging and health checks.
- Backup/restore runbook.
- Mini-program review checklist.

