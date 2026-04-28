/**
 * Flat endpoints for project list items and day modifications.
 * Needed because the frontend repo interface only exposes the item ID,
 * not the full parent path (projectId / dayId), for update and delete.
 */
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateId, nowISO } from '../lib/utils.js';

const app = new Hono();
app.use('/*', authMiddleware);

// ---------------------------------------------------------------------------
// Project general list items — flat (by item ID only)
// ---------------------------------------------------------------------------
app.put('/list-items/:id', async (c) => {
  const body = await c.req.json();
  const [item] = await db
    .update(schema.projectGeneralLists)
    .set({ ...body, updatedAt: nowISO() })
    .where(eq(schema.projectGeneralLists.id, c.req.param('id')))
    .returning();

  if (!item) return c.json({ error: 'Not found' }, 404);
  return c.json(item);
});

app.delete('/list-items/:id', async (c) => {
  await db
    .delete(schema.projectGeneralLists)
    .where(eq(schema.projectGeneralLists.id, c.req.param('id')));
  return c.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Day list modifications — flat (by mod ID only)
// Also handles POST since the frontend only knows dayId, not projectId
// ---------------------------------------------------------------------------
app.post('/day-modifications', async (c) => {
  const body = await c.req.json();
  const now = nowISO();
  const [mod] = await db
    .insert(schema.dayListModifications)
    .values({ id: generateId(), ...body, createdAt: now, updatedAt: now })
    .returning();
  return c.json(mod, 201);
});

app.put('/day-modifications/:id', async (c) => {
  const body = await c.req.json();
  const [mod] = await db
    .update(schema.dayListModifications)
    .set({ ...body, updatedAt: nowISO() })
    .where(eq(schema.dayListModifications.id, c.req.param('id')))
    .returning();

  if (!mod) return c.json({ error: 'Not found' }, 404);
  return c.json(mod);
});

app.delete('/day-modifications/:id', async (c) => {
  await db
    .delete(schema.dayListModifications)
    .where(eq(schema.dayListModifications.id, c.req.param('id')));
  return c.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Template items — flat delete (by item ID only)
// ---------------------------------------------------------------------------
app.delete('/template-items/:id', async (c) => {
  await db
    .delete(schema.templateItems)
    .where(eq(schema.templateItems.id, c.req.param('id')));
  return c.json({ ok: true });
});

export default app;
