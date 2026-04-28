# ── Stage 1: Build the React frontend ──────────────────────────────────────
FROM node:22-alpine AS frontend-build
WORKDIR /app
# Override any injected NODE_ENV=production so devDependencies (tsc, vite) are installed
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Stage 2: Build the Hono server ─────────────────────────────────────────
FROM node:22-alpine AS server-build
WORKDIR /app/server
ENV NODE_ENV=development
COPY server/package.json ./
RUN npm install
COPY server/ .
RUN npm run build && npm prune --omit=dev

# ── Stage 3: Runtime image ──────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app

# Production server code + pruned dependencies
COPY --from=server-build /app/server/dist    ./server/dist
COPY --from=server-build /app/server/node_modules ./server/node_modules
COPY server/package.json ./server/

# Gear data referenced by the seeder at runtime:
#   node server/dist/db/seed.js → joins __dirname/../../../src/data/gear → /app/src/data/gear
COPY src/data ./src/data

# Vite SPA build served as static files by Hono (join(__dirname, '../public'))
COPY --from=frontend-build /app/dist ./server/public

ENV NODE_ENV=production
ENV PORT=3100

EXPOSE 3100

CMD ["node", "server/dist/index.js"]
