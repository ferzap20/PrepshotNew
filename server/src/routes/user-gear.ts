import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateId, nowISO } from '../lib/utils.js';

const app = new Hono();
app.use('/*', authMiddleware);

app.get('/', async (c) => {
  const { userId } = c.get('user');
  const rows = await db
    .select()
    .from(schema.userGear)
    .where(eq(schema.userGear.userId, userId));
  return c.json(rows);
});

app.post('/', async (c) => {
  const { userId } = c.get('user');
  const body = await c.req.json();
  const now = nowISO();
  const [item] = await db
    .insert(schema.userGear)
    .values({ id: generateId(), userId, ...body, createdAt: now, updatedAt: now })
    .returning();
  return c.json(item, 201);
});

app.get('/:id', async (c) => {
  const { userId } = c.get('user');
  const [item] = await db
    .select()
    .from(schema.userGear)
    .where(and(eq(schema.userGear.id, c.req.param('id')), eq(schema.userGear.userId, userId)))
    .limit(1);

  if (!item) return c.json({ error: 'Not found' }, 404);
  return c.json(item);
});

app.put('/:id', async (c) => {
  const { userId } = c.get('user');
  const body = await c.req.json();
  const [item] = await db
    .update(schema.userGear)
    .set({ ...body, updatedAt: nowISO() })
    .where(and(eq(schema.userGear.id, c.req.param('id')), eq(schema.userGear.userId, userId)))
    .returning();

  if (!item) return c.json({ error: 'Not found' }, 404);
  return c.json(item);
});

app.delete('/:id', async (c) => {
  const { userId } = c.get('user');
  await db
    .delete(schema.userGear)
    .where(and(eq(schema.userGear.id, c.req.param('id')), eq(schema.userGear.userId, userId)));
  return c.json({ ok: true });
});

export default app;
