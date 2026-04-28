import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { nowISO } from '../lib/utils.js';

const app = new Hono();
app.use('/*', authMiddleware);

app.get('/', async (c) => {
  const { userId } = c.get('user');
  const rows = await db
    .select()
    .from(schema.appSettings)
    .where(eq(schema.appSettings.userId, userId));

  // Return as key→value map for easy consumption on the frontend
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;
  return c.json(map);
});

app.put('/:key', async (c) => {
  const { userId } = c.get('user');
  const body = await c.req.json<{ value: string }>();
  const key = c.req.param('key');
  const now = nowISO();

  await db
    .insert(schema.appSettings)
    .values({ key, userId, value: body.value, updatedAt: now })
    .onConflictDoUpdate({
      target: [schema.appSettings.key, schema.appSettings.userId],
      set: { value: body.value, updatedAt: now },
    });

  return c.json({ key, value: body.value });
});

app.delete('/:key', async (c) => {
  const { userId } = c.get('user');
  await db
    .delete(schema.appSettings)
    .where(
      and(
        eq(schema.appSettings.key, c.req.param('key')),
        eq(schema.appSettings.userId, userId),
      ),
    );
  return c.json({ ok: true });
});

export default app;
