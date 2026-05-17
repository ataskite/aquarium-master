FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
RUN corepack pnpm install --filter @aquarium/api --frozen-lockfile=false

FROM deps AS build
COPY apps/api apps/api
RUN corepack pnpm --filter @aquarium/api prisma:generate
RUN corepack pnpm --filter @aquarium/api build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/prisma apps/api/prisma
COPY --from=build /app/apps/api/package.json apps/api/package.json
CMD ["node", "apps/api/dist/main.js"]
