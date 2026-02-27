# PrepShot

A Progressive Web App for managing film production equipment, shooting days, and gear lists. Designed for camera crew members (ACs, DPs, Gaffers, Grips) who need to manage their prep work offline-first.

---

## Features

- **Projects** — Create and manage film projects with crew info, dates, and notes
- **Gear Lists** — Dual-panel editor: browse the catalog, add from My Gear, publish lists
- **Shooting Days** — Calendar view, per-day gear adjustments (Add / Remove / Modify)
- **Catalog** — Admin-managed equipment catalog (142 pre-seeded items: cameras, lenses, cables, grip, lights)
- **My Gear** — Track your personal equipment with condition and serial number
- **Templates** — Save gear packages and apply them to projects
- **Rental Sources** — Map of rental houses with Leaflet + Nominatim geocoding
- **Settings** — Date format, account name, data export/clear
- **PWA** — Installable, offline-ready, service worker caching

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript (strict) |
| Routing | React Router v7 |
| Database | IndexedDB via `idb` v8 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Build | Vite 7 |
| PWA | `vite-plugin-pwa` + Workbox |
| Maps | Leaflet + React Leaflet |
| Auth | bcryptjs (client-side, offline MVP) |
| Icons | Lucide React |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Admin account (seeded on first run)

```
Email:    admin@prepshot.local
Password: admin
```

---

## Architecture

```
src/
├── app/            # Router + App root + ErrorBoundary
├── components/     # Reusable UI + feature components
│   ├── ui/         # Button, Modal, Card, Input, Badge, CategoryFilterPills, ErrorBoundary
│   ├── guards/     # AuthGuard, AdminGuard
│   ├── layout/     # AppLayout, Header, Sidebar
│   └── projects/   # Project CRUD modals + form
├── contexts/       # AuthContext, ThemeContext, SidebarContext
├── hooks/          # useAuth, useAppSetting, useProjects, useOnlineStatus
├── lib/
│   ├── auth/       # auth-service.ts (login, register, session)
│   ├── db/
│   │   ├── connection.ts   # IndexedDB singleton (DB_VERSION=3)
│   │   ├── schema.ts       # 14 stores + type definitions
│   │   ├── seed.ts         # Admin user + default settings + catalog seed
│   │   └── repositories/   # One repo per store (CRUD pattern)
│   └── utils/      # cn, date, id utilities
├── pages/          # 15 lazy-loaded route pages
├── types/          # models.ts (13 interfaces) + enums.ts
└── data/gear/      # 5 JSON files (142 catalog items)
```

### Data flow

```
Page → Repository → IndexedDB
         ↑
    Custom hook / direct call
```

### Database (IndexedDB)

- Version: 3
- 14 stores: users, projects, project_members, shooting_days, daily_documents, catalog_items, rental_sources, catalog_rental_sources, project_general_lists, day_list_modifications, package_templates, template_items, user_gear, app_settings
- Migrations: additive only (v1→v2: added user_gear + app_settings; v2→v3: added project_members)

---

## Development

```bash
# Lint
npm run lint

# Format (Prettier)
npm run format

# Check formatting
npm run format:check
```

### Conventions

- **Modals**: `*Modals.tsx` files contain Create + Edit + Delete modals together
- **Pages**: async `load()` function + `useEffect(() => { load(); }, [deps])`
- **Skeleton loading**: `animate-pulse` divs matching expected height
- **Category pills**: `bg-primary` when active, `bg-secondary` otherwise
- **Dual-panel pages**: 60/40 split on `lg+`, mobile tabs (`hidden lg:flex` pattern)
- **IDs**: UUID v4 for user-created entities; string IDs (e.g. `camera_arri_alexa35`) for seeded catalog items

### Enums

All business enums are in `src/types/enums.ts`. This includes `CREW_ROLES_BY_TYPE` — the authoritative mapping of crew department → available roles.

---

## Roadmap

- [ ] Backend (PostgreSQL + REST API)
- [ ] JWT-based sessions
- [ ] Vitest unit tests + integration tests
- [ ] Real-time collaboration (invitations, shared projects)
- [ ] List virtualization for large catalogs
- [ ] Light mode
