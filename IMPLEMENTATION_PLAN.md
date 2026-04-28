# PrepShot — Server Migration Implementation Plan

## Overview

Moving PrepShot from a client-only SPA (React + IndexedDB) to a full-stack app
with a Hono/PostgreSQL backend, deployed on the home server via Coolify,
accessible at `prepshot.studiomirabelle.eu`.

This pattern also establishes the infrastructure template for future projects.

---

## Architecture

```
Browser
  └─ prepshot.studiomirabelle.eu
       │
  Cloudflare → Tunnel → NPM (:80) → http://192.168.1.179:3100
                                            │
                                      Hono server (port 3100)
                                      ├── /api/*  ← REST API
                                      └── /*      ← React SPA (Vite build)
                                            │
                                      PostgreSQL (shared Coolify instance)
                                      database: prepshot_db
```

### Tech stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Backend framework | Hono | TypeScript, ESM-native, fast |
| ORM | Drizzle ORM | TypeScript-first, SQL-close |
| Database | PostgreSQL 16 | Shared Coolify instance; one DB per project |
| Auth | JWT (jose) in httpOnly cookie | 7-day token, no Authelia needed |
| Deployment | Coolify → git push | Auto-build on push to main |
| NPM entry | No Authelia block | App manages its own users |

### Multi-project convention
- **One shared PostgreSQL** instance in Coolify (different database per project)
- **Port registry**: PrepShot = 3100, future projects = 3101, 3102, …
- **Domain pattern**: `<project>.studiomirabelle.eu` → NPM → `192.168.1.179:<port>`
- **Coolify**: each project is its own service in Coolify

---

## Session Status

| # | Session | Status |
|---|---------|--------|
| 1 | Backend foundation (all server code) | ✅ Done |
| 2 | Frontend migration (replace IndexedDB with API client) | ✅ Done |
| 3 | Dockerization (Dockerfile + docker-compose.coolify.yml) | ✅ Done |
| 4 | Server setup via SSH (PostgreSQL, Coolify app, NPM, Cloudflare) | ✅ Done |
| 5 | Go-live (deploy, seed, test, change passwords) | 🟡 In progress |

---

## Session 1 — Backend Foundation ✅

**Delivered files:**
```
server/
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── .env.example
└── src/
    ├── index.ts              ← Hono app entry (API + static serving in prod)
    ├── lib/
    │   └── utils.ts          ← generateId(), nowISO()
    ├── db/
    │   ├── schema.ts         ← 14 PostgreSQL tables (Drizzle)
    │   ├── connection.ts     ← pg pool + Drizzle instance
    │   ├── migrate.ts        ← migration runner (run after schema changes)
    │   └── seed.ts           ← admin user + full catalog seeder
    ├── middleware/
    │   ├── auth.ts           ← JWT cookie verification
    │   └── admin.ts          ← role === 'admin' guard
    └── routes/
        ├── auth.ts           ← POST /api/auth/{login,register,logout} GET /api/auth/me
        ├── projects.ts       ← /api/projects + members + list-items + days + modifications
        ├── catalog.ts        ← GET /api/catalog + admin write + POST /api/admin/catalog/import
        ├── rental-sources.ts ← /api/rental-sources + catalog linking
        ├── templates.ts      ← /api/templates + template items
        ├── user-gear.ts      ← /api/my-gear
        └── settings.ts       ← /api/settings (per-user key/value)
```

**How to test the backend locally:**
```bash
# Terminal 1 — React frontend (no changes yet, IndexedDB still active)
npm run dev

# Terminal 2 — Hono backend
cd server
cp .env.example .env        # edit: set DATABASE_URL and JWT_SECRET
npm install
npm run db:generate         # generates SQL migration files in server/drizzle/
npm run db:migrate          # applies migrations to the database
npm run db:seed             # inserts admin user + full catalog
npm run dev                 # starts on http://localhost:3100

# Verify the API is running:
curl http://localhost:3100/api/auth/me
# → {"error":"Unauthorized"} — correct, not logged in yet

curl -X POST http://localhost:3100/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@prepshot.local","password":"admin"}'
# → {"id":"...","email":"admin@prepshot.local","role":"admin"}
```

---

## Session 2 — Frontend Migration ⬜

**Goal:** Replace all IndexedDB calls with `fetch` API calls. Auth moves from
localStorage session to httpOnly JWT cookie. No page/component changes needed.

**What changes:**
- `src/lib/db/` → **DELETE** (IndexedDB connection, schema, all repos)
- `src/lib/api/` → **CREATE** (one file per entity, same function signatures as old repos)
  - `client.ts` — base fetch wrapper (handles auth errors, JSON parsing)
  - `projects.ts`, `catalog.ts`, `user-gear.ts`, etc.
- `src/contexts/AuthContext.tsx` — replace IndexedDB auth with `/api/auth/*` calls
- `src/contexts/AppSettingsContext.tsx` — replace IndexedDB with `/api/settings`
- `src/lib/db/seed.ts` — DELETE (seeding moves to server)

**What stays the same:**
- All pages, components, hooks — zero changes needed
- All TypeScript models in `src/types/` — zero changes
- Routing — zero changes
- The repo function signatures are preserved exactly, so hooks that call them need no updates

---

## Session 3 — Dockerization ✅

**Goal:** Multi-stage Dockerfile that produces a single container serving both
the Vite SPA and the Hono API.

**Deliverables:**
- `Dockerfile` — 3 stages: build frontend → build server → final runtime image
- `docker-compose.coolify.yml` — for Coolify to understand the service
- `.dockerignore`

**Build flow inside Docker:**
1. Stage 1: `npm run build` in root → produces `dist/`
2. Stage 2: `npm run build` in `server/` → produces `server/dist/`
3. Stage 3: Copy `dist/` → `server/public/`, run `node server/dist/index.js`

**Port:** `3100` exposed from container.

---

## Session 4 — Server Setup (SSH work) ✅

**Do these steps via SSH on your home server:**

### Step 1 — PostgreSQL via Coolify (shared, do once for all projects)
1. Coolify → Resources → New → Database → PostgreSQL 16
2. Set a strong password; note the **internal** connection string
3. Once running: `docker exec -it <postgres-container> psql -U postgres`
4. Create the PrepShot database:
   ```sql
   CREATE DATABASE prepshot_db;
   ```
5. Note the connection string for use in Coolify env vars:
   `postgresql://postgres:<password>@<coolify-postgres-host>:5432/prepshot_db`

### Step 2 — Coolify app setup
1. Coolify → Projects → New Project → "PrepShot"
2. New Resource → Application → GitHub repo → branch `main`
3. Build type: **Dockerfile** (will use the `Dockerfile` from Session 3)
4. Port: `3100`
5. Environment variables:
   ```
   DATABASE_URL=postgresql://postgres:<pass>@<host>:5432/prepshot_db
   JWT_SECRET=<generate: openssl rand -base64 32>
   NODE_ENV=production
   PORT=3100
   ```
6. Deploy → wait for build to finish
7. Note the container name (you'll need it for the seed step)

### Step 3 — Run seeder on the deployed container
```bash
docker exec <prepshot-container-name> node dist/db/seed.js
```

### Step 4 — NPM proxy entry
1. NPM admin → Add Proxy Host
2. Domain: `prepshot.studiomirabelle.eu`
3. Scheme: `http`, Forward hostname: `192.168.1.179`, Port: `3100`
4. **SSL:** Request new Let's Encrypt cert, enable Force HTTPS: **OFF**
   (tunnel sends HTTP internally; Force SSL = redirect loop)
5. Advanced tab — leave blank (no Authelia block — app has its own login)

### Step 5 — Cloudflare Tunnel
1. Cloudflare Zero Trust → Networks → Tunnels → your tunnel → Edit
2. Public Hostnames → Add a hostname:
   - Subdomain: `prepshot`
   - Domain: `studiomirabelle.eu`
   - Service: `http://npm:80`
3. Save

### Step 6 — Verify
```bash
curl https://prepshot.studiomirabelle.eu/api/auth/me
# → {"error":"Unauthorized"} — DNS + NPM + app all working
```

---

## Session 5 — Go-Live 🟡

✅ App is reachable at https://prepshot.studiomirabelle.eu and login works.

**Still to do:**
1. ⬜ Change admin password (Settings → Account)
2. ⬜ Register your real user account
3. ⬜ Smoke test: create a project, add gear, create a shooting day, mark items rented
4. ⬜ Verify catalog loaded (Admin → Catalog: should show 469 items)

---

## Deployment Gotchas — Lessons Learned (for future projects)

These bit us during PrepShot's deployment. Apply them up front for the next project.

### Coolify quirks
- **`coolify-db` is internal** — that's Coolify's own Postgres. Create a *separate* PostgreSQL resource for projects.
- **Coolify injects `NODE_ENV=production` at build time**, which makes `npm ci` skip devDependencies. Override it inside the Dockerfile build stages with `ENV NODE_ENV=development`. Only the final runtime stage should have `NODE_ENV=production`.
- **Coolify does NOT publish container ports to the host by default** even if the Dockerfile has `EXPOSE`. You must set **"Ports Mappings: 3100:3100"** (or whatever port) in the app's Coolify config. Without this, NPM can't reach the container at `192.168.1.179:3100`.
- **Container names use the image hash, not the project name.** To find the container, grep by the hash visible in Coolify build logs (e.g. `docker ps | grep <hash>`), not by project name.
- The "ARG JWT_SECRET" warning during build is harmless — Coolify auto-injects all env vars as build args.

### Drizzle migrations
- The `server/drizzle/` folder must be **generated locally** with `cd server && npm run db:generate`, then **committed to git**. The Dockerfile copies it into the runtime image.
- Auto-run migrations at server startup (`migrate()` in `index.ts`). It's idempotent and means redeploys "just work" without manual migration steps.

### Lint blocker
- ESLint rule `react-refresh/only-export-components` will fail CI if a component file exports a non-component function. Move helpers to `src/utils/`.

### Network topology that worked
```
Browser → Cloudflare → Tunnel (cloudflared) → npm:80 → 192.168.1.179:3100 → container:3100
```
Force SSL in NPM = **OFF** (tunnel sends HTTP internally; would cause redirect loop).

### Reference values (PrepShot)
| Item | Value |
|------|-------|
| Domain | `prepshot.studiomirabelle.eu` |
| Container port | `3100` |
| Coolify Postgres container | `opvz9zji231pmxs7ddwghyoj` |
| Coolify image-hash prefix | `hzfdcjwr7yjjs4uugfiellj2` |
| Database name | `prepshot_db` |
| Admin login (CHANGE THIS) | `admin@prepshot.local` / `admin` |

---

## Batch Catalog Import

Two ways to add gear in bulk after initial deployment:

### Method A — JSON file (recommended for large batches)
1. Add a new file to `server/src/data/gear/` matching the existing format
2. Register it in `server/src/db/seed.ts` (add to the `allRaw` array)
3. Run: `npm run db:seed` (idempotent — skips items that already exist by ID)
4. Commit and push → Coolify redeploys, run `docker exec ... node dist/db/seed.js` again

### Method B — Admin API endpoint (for one-off imports)
```bash
# Must be logged in as admin; use the cookie from your browser session
curl -X POST https://prepshot.studiomirabelle.eu/api/admin/catalog/import \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<your-jwt-token>" \
  -d '[
    {
      "id": "camera_sony_fx9",
      "name": "Sony FX9",
      "brand": "Sony",
      "category": "Camera",
      "subcategory": "Full Frame Cinema Camera",
      "description": "Full-frame sensor cinema camera with fast hybrid AF.",
      "weight_kg": 2.0,
      "connectors": ["SDI", "HDMI"]
    }
  ]'
# Response: { "created": 1, "skipped": 0, "errors": [] }
```

**JSON format** (same as the gear JSON files):
```typescript
{
  id: string;           // unique, e.g. "camera_sony_fx9" — used as DB primary key
  name: string;
  brand: string;
  category: "Camera" | "Lens" | "Cable" | "Accessory" | "Grip" | "Lighting" | "Audio";
  subcategory?: string;
  description?: string;
  mount?: string;
  specs?: Record<string, unknown>;
  weight_kg?: number;
  connectors?: string[];
  compatibility?: string[];
  source?: string;
}
```

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/prepshot_db` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `openssl rand -base64 32` |
| `PORT` | Server port | `3100` |
| `NODE_ENV` | `development` or `production` | `production` |

---

## Key Paths

| Purpose | Path |
|---------|------|
| Server source | `server/src/` |
| DB schema | `server/src/db/schema.ts` |
| Drizzle migrations | `server/drizzle/` |
| Gear JSON data | `server/src/data/gear/` |
| API routes | `server/src/routes/` |
| Env example | `server/.env.example` |
