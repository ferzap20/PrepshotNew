import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import { nowISO } from '../lib/utils.js';

const app = new Hono();
app.use('/*', authMiddleware);

// Lookup a single user by email — returns minimal info, no password hash
app.get('/lookup', async (c) => {
  const email = c.req.query('email')?.toLowerCase();
  if (!email) return c.json({ error: 'email required' }, 400);
  const [user] = await db
    .select({ id: schema.users.id, email: schema.users.email, name: schema.users.name, createdAt: schema.users.createdAt })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  if (!user) return c.json({ error: 'Not found' }, 404);
  return c.json(user);
});

// List all users — available to all authenticated users (for project member assignment)
app.get('/', async (c) => {
  const rows = await db
    .select({ id: schema.users.id, email: schema.users.email, role: schema.users.role, name: schema.users.name, createdAt: schema.users.createdAt, updatedAt: schema.users.updatedAt })
    .from(schema.users);
  return c.json(rows);
});

app.get('/:id', async (c) => {
  const [user] = await db
    .select({ id: schema.users.id, email: schema.users.email, role: schema.users.role, name: schema.users.name, createdAt: schema.users.createdAt, updatedAt: schema.users.updatedAt })
    .from(schema.users)
    .where(eq(schema.users.id, c.req.param('id')))
    .limit(1);

  if (!user) return c.json({ error: 'Not found' }, 404);
  return c.json(user);
});

// Update user — own profile (name) or admin can update any field including role
app.put('/:id', async (c) => {
  const { userId, role } = c.get('user');
  const targetId = c.req.param('id');

  if (userId !== targetId && role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const body = await c.req.json<{ name?: string; role?: string }>();

  // Non-admins cannot change role
  if (role !== 'admin') {
    delete body.role;
  }

  const [user] = await db
    .update(schema.users)
    .set({ ...body, updatedAt: nowISO() })
    .where(eq(schema.users.id, targetId))
    .returning({ id: schema.users.id, email: schema.users.email, role: schema.users.role, name: schema.users.name, createdAt: schema.users.createdAt, updatedAt: schema.users.updatedAt });

  if (!user) return c.json({ error: 'Not found' }, 404);
  return c.json(user);
});

// Admin-only: delete a user
app.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  await db.delete(schema.users).where(eq(schema.users.id, c.req.param('id')));
  return c.json({ ok: true });
});

export default app;
