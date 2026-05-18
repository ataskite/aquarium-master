#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# ── Colors ──────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'
BOLD='\033[1m'; NC='\033[0m'

info()  { printf "${CYAN}${BOLD}▸${NC} $*\n"; }
ok()    { printf "${GREEN}${BOLD}✓${NC} $*\n"; }
warn()  { printf "${YELLOW}${BOLD}!${NC} $*\n"; }
fail()  { printf "${RED}${BOLD}✗${NC} $*\n"; exit 1; }

cleanup() {
  printf "\n"
  info "Shutting down..."
  if [ -n "${API_PID:-}" ]; then kill "$API_PID" 2>/dev/null || true; fi
  if [ -n "${H5_PID:-}" ]; then  kill "$H5_PID"  2>/dev/null || true; fi
  wait 2>/dev/null
  info "Stopping Docker containers..."
  docker compose down 2>/dev/null || true
  ok "All processes stopped."
}
trap cleanup EXIT INT TERM

# ── .env ────────────────────────────────────────────────
if [ ! -f .env ]; then
  info "Creating .env from .env.example..."
  cp .env.example .env
  ok ".env created"
fi
set -a; source .env; set +a

# ── Docker deps ─────────────────────────────────────────
info "Starting Docker containers (postgres, minio)..."
docker compose up -d postgres minio
ok "Docker containers ready"

# ── Dependencies (skip if already installed) ────────────
if [ ! -d node_modules ] || [ ! -d apps/api/node_modules ] || [ ! -d apps/weapp/node_modules ]; then
  info "Installing dependencies..."
  corepack pnpm install
  ok "Dependencies installed"
fi

# ── Prisma client (skip if already generated) ───────────
if [ ! -d apps/api/node_modules/.prisma ]; then
  info "Generating Prisma client..."
  corepack pnpm prisma:generate
  ok "Prisma client ready"
fi

# ── Wait for Postgres ───────────────────────────────────
info "Waiting for PostgreSQL..."
until docker compose exec -T postgres pg_isready -U aquarium -d aquarium &>/dev/null; do
  sleep 0.5
done
ok "PostgreSQL is ready"

# ── Prisma migrate (skip if tables exist) ───────────────
if ! docker compose exec -T postgres psql -U aquarium -d aquarium -c "SELECT COUNT(*) FROM _prisma_migrations" &>/dev/null; then
  info "Running Prisma migration..."
  corepack pnpm prisma:migrate
  ok "Database migrated"
fi

# ── Start API (background) ─────────────────────────────
info "Starting API server..."
corepack pnpm dev:api &
API_PID=$!

# ── Wait for API ────────────────────────────────────────
info "Waiting for API..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/api > /dev/null 2>&1; then
    break
  fi
  sleep 0.5
done
ok "API running at http://localhost:3000/api"

# ── Start H5 (background) ──────────────────────────────
info "Starting H5 dev server..."
corepack pnpm dev:h5 &
H5_PID=$!

# ── Wait for H5 ─────────────────────────────────────────
info "Waiting for H5 dev server..."
for i in $(seq 1 60); do
  if curl -sf http://localhost:10086 > /dev/null 2>&1; then
    break
  fi
  sleep 0.5
done
ok "H5 running at http://localhost:10086"

# ── Open browser (mobile viewport) ─────────────────────
H5_URL="http://localhost:10086"
info "Opening Chrome in mobile mode..."
if [[ "$(uname)" == "Darwin" ]]; then
  # Wait a bit for Chrome to be ready
  sleep 1
  # AppleScript: open Chrome in mobile device mode
  osascript -e '
    tell application "Google Chrome"
      activate
      delay 0.5
      if (count of windows) = 0 then
        make new window
      end if
      set URL of active tab of front window to "'"$H5_URL"'"
      delay 1
      tell application "System Events"
        tell process "Chrome"
          -- Open DevTools: Cmd+Option+I
          keystroke "i" using {command down, option down}
          delay 2
          -- Toggle device toolbar: Cmd+Shift+M
          keystroke "m" using {command down, shift down}
        end tell
      end tell
    end tell
  ' 2>/dev/null || true
else
  # Linux: try Chrome/Chromium
  google-chrome "$H5_URL" 2>/dev/null || google-chrome-stable "$H5_URL" 2>/dev/null || chromium-browser "$H5_URL" 2>/dev/null || true
fi

printf "\n${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
printf "${GREEN}${BOLD}  Aquarium Master dev environment is running${NC}\n"
printf "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n\n"
printf "  %-18s %s\n" "H5 Preview"   "$H5_URL"
printf "  %-18s %s\n" "API"          "http://localhost:3000/api"
printf "  %-18s %s\n" "MinIO Console" "http://localhost:9001"
printf "\n  Press ${BOLD}Ctrl+C${NC} to stop all services.\n\n"

wait
