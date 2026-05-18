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

# ── Load .env ───────────────────────────────────────────
if [ ! -f .env ]; then
  fail ".env file not found. Please create it from .env.example"
fi
set -a; source .env; set +a

# ── Confirm ─────────────────────────────────────────────
printf "${RED}${BOLD}⚠️  WARNING: This will completely reset the database!${NC}\n"
printf "  All data will be ${RED}${BOLD}permanently deleted${NC}.\n\n"
read -p "Are you sure? (type 'yes' to confirm): " confirm
if [ "$confirm" != "yes" ]; then
  info "Cancelled."
  exit 0
fi

# ── Start PostgreSQL if not running ─────────────────────
info "Checking PostgreSQL..."
if ! docker compose ps postgres | grep -q "Up"; then
  info "Starting PostgreSQL..."
  docker compose up -d postgres
  docker compose exec -T postgres pg_isready -U "${POSTGRES_USER:-aquarium}" -d "${POSTGRES_DB:-aquarium}" || {
    info "Waiting for PostgreSQL to be ready..."
    until docker compose exec -T postgres pg_isready -U "${POSTGRES_USER:-aquarium}" -d "${POSTGRES_DB:-aquarium}" &>/dev/null; do
      sleep 0.5
    done
  }
  ok "PostgreSQL is ready"
else
  ok "PostgreSQL is running"
fi

# ── Reset database ───────────────────────────────────────
info "Applying Prisma migrations..."
corepack pnpm --filter @aquarium/api exec prisma migrate deploy
ok "Prisma migrations applied"

info "Resetting database..."
docker compose exec -T postgres psql -U "${POSTGRES_USER:-aquarium}" -d "${POSTGRES_DB:-aquarium}" < database/init-db.sql
ok "Database reset complete"

# ── Summary ──────────────────────────────────────────────
printf "\n${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
printf "${GREEN}${BOLD}  Database has been reset with realistic seed data${NC}\n"
printf "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n\n"
printf "  %-20s %s\n" "Seed User"     "水族新手 (openId: mock-openid-demo)"
printf "  %-20s %s\n" "Aquariums"     "10 个鱼缸（含虾缸、三湖慈鲷缸、草缸等）"
printf "  %-20s %s\n" "Fish Species"   "30+ 个真实鱼种档案（灯鱼、鼠鱼、虾类、慈鲷等）"
printf "  %-20s %s\n" "Fish Stocks"    "19 条鱼缸鱼只库存"
printf "  %-20s %s\n" "Devices"        "20+ 条设备档案"
printf "  %-20s %s\n" "Profiles"       "10 套目标水质区间"
printf "  %-20s %s\n" "Feeding"        "11 条投喂模板"
printf "  %-20s %s\n" "Water Records"  "21 条水质记录"
printf "  %-20s %s\n" "Maintenance"    "16 条维护记录"
printf "  %-20s %s\n" "Reminders"      "12 条提醒"
printf "  %-20s %s\n" "Knowledge"      "8 篇知识库文章\n"
