import 'dotenv/config';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './db/connection.js';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import { catalogPublicApp, catalogAdminApp } from './routes/catalog.js';
import rentalSourceRoutes from './routes/rental-sources.js';
import templateRoutes from './routes/templates.js';
import userGearRoutes from './routes/user-gear.js';
import settingsRoutes from './routes/settings.js';
import userRoutes from './routes/users.js';
import flatRoutes from './routes/list-items.js';
import notificationRoutes from './routes/notifications.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT ?? 3100);

const app = new Hono();

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use('*', logger());

if (!isProd) {
  // In dev, frontend runs on Vite (:5173) — allow cross-origin requests with cookies
  app.use(
    '*',
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    }),
  );
}

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
app.route('/api/auth', authRoutes);
app.route('/api/projects', projectRoutes);
app.route('/api/catalog', catalogPublicApp);
app.route('/api/admin/catalog', catalogAdminApp);
app.route('/api/rental-sources', rentalSourceRoutes);
app.route('/api/templates', templateRoutes);
app.route('/api/my-gear', userGearRoutes);
app.route('/api/settings', settingsRoutes);
app.route('/api/users', userRoutes);
app.route('/api', flatRoutes); // flat: /api/list-items/:id, /api/day-modifications/:id
app.route('/api/notifications', notificationRoutes);

// ---------------------------------------------------------------------------
// Static frontend (production only)
// The Dockerfile copies the Vite build output to server/public/
// ---------------------------------------------------------------------------
if (isProd) {
  const publicDir = join(__dirname, '../public');
  const indexPath = join(publicDir, 'index.html');

  app.use('/*', serveStatic({ root: join(__dirname, '../public') }));

  // SPA fallback — any unmatched route returns index.html
  app.get('/*', (c) => {
    if (!existsSync(indexPath)) {
      return c.text('Frontend build not found. Run "npm run build" first.', 503);
    }
    return c.html(readFileSync(indexPath, 'utf-8'));
  });
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
async function start() {
  console.log('Running database migrations…');
  await migrate(db, { migrationsFolder: join(__dirname, '../drizzle') });
  console.log('Migrations complete.');

  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`PrepShot server running on http://localhost:${info.port}`);
    if (!isProd) {
      console.log('Dev mode: frontend should run separately on http://localhost:5173');
    }
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
