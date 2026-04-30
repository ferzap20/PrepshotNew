import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';

const app = new Hono();
app.use('/*', authMiddleware);

app.get('/', async (c) => {
  const { userId } = c.get('user');
  const rows = await db
    .select()
    .from(schema.notifications)
    .where(eq(schema.notifications.userId, userId))
    .orderBy(schema.notifications.createdAt);
  rows.reverse(); // newest first, no desc import needed
  return c.json(rows.slice(0, 30));
});

app.post('/read-all', async (c) => {
  const { userId } = c.get('user');
  await db
    .update(schema.notifications)
    .set({ read: true })
    .where(eq(schema.notifications.userId, userId));
  return c.json({ ok: true });
});

app.delete('/:id', async (c) => {
  const { userId } = c.get('user');
  await db
    .delete(schema.notifications)
    .where(
      and(
        eq(schema.notifications.id, c.req.param('id')),
        eq(schema.notifications.userId, userId),
      ),
    );
  return c.json({ ok: true });
});

export default app;
