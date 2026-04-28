import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateId, nowISO } from '../lib/utils.js';

const app = new Hono();
app.use('/*', authMiddleware);

// ---------------------------------------------------------------------------
// Templates CRUD
// ---------------------------------------------------------------------------

app.get('/', async (c) => {
  const { userId } = c.get('user');
  const rows = await db
    .select()
    .from(schema.packageTemplates)
    .where(eq(schema.packageTemplates.userId, userId));
  return c.json(rows);
});

app.post('/', async (c) => {
  const { userId } = c.get('user');
  const body = await c.req.json();
  const now = nowISO();
  const [template] = await db
    .insert(schema.packageTemplates)
    .values({ id: generateId(), userId, ...body, createdAt: now, updatedAt: now })
    .returning();
  return c.json(template, 201);
});

app.get('/:id', async (c) => {
  const { userId } = c.get('user');
  const [template] = await db
    .select()
    .from(schema.packageTemplates)
    .where(
      and(eq(schema.packageTemplates.id, c.req.param('id')), eq(schema.packageTemplates.userId, userId)),
    )
    .limit(1);

  if (!template) return c.json({ error: 'Not found' }, 404);
  return c.json(template);
});

app.put('/:id', async (c) => {
  const { userId } = c.get('user');
  const body = await c.req.json();
  const [template] = await db
    .update(schema.packageTemplates)
    .set({ ...body, updatedAt: nowISO() })
    .where(
      and(eq(schema.packageTemplates.id, c.req.param('id')), eq(schema.packageTemplates.userId, userId)),
    )
    .returning();

  if (!template) return c.json({ error: 'Not found' }, 404);
  return c.json(template);
});

app.delete('/:id', async (c) => {
  const { userId } = c.get('user');
  await db
    .delete(schema.packageTemplates)
    .where(
      and(eq(schema.packageTemplates.id, c.req.param('id')), eq(schema.packageTemplates.userId, userId)),
    );
  return c.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Template Items
// ---------------------------------------------------------------------------

app.get('/:id/items', async (c) => {
  const rows = await db
    .select()
    .from(schema.templateItems)
    .where(eq(schema.templateItems.templateId, c.req.param('id')));
  return c.json(rows);
});

app.post('/:id/items', async (c) => {
  const body = await c.req.json();
  const [item] = await db
    .insert(schema.templateItems)
    .values({ id: generateId(), templateId: c.req.param('id'), ...body })
    .returning();
  return c.json(item, 201);
});

app.put('/:id/items/:itemId', async (c) => {
  const body = await c.req.json();
  const [item] = await db
    .update(schema.templateItems)
    .set(body)
    .where(
      and(
        eq(schema.templateItems.id, c.req.param('itemId')),
        eq(schema.templateItems.templateId, c.req.param('id')),
      ),
    )
    .returning();

  if (!item) return c.json({ error: 'Not found' }, 404);
  return c.json(item);
});

app.delete('/:id/items/:itemId', async (c) => {
  await db
    .delete(schema.templateItems)
    .where(
      and(
        eq(schema.templateItems.id, c.req.param('itemId')),
        eq(schema.templateItems.templateId, c.req.param('id')),
      ),
    );
  return c.json({ ok: true });
});

export default app;
