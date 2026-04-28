import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateId, nowISO } from '../lib/utils.js';

const app = new Hono();
app.use('/*', authMiddleware);

app.get('/', async (c) => {
  const rows = await db.select().from(schema.rentalSources);
  return c.json(rows);
});

app.post('/', async (c) => {
  const body = await c.req.json();
  const now = nowISO();
  const [source] = await db
    .insert(schema.rentalSources)
    .values({ id: generateId(), ...body, createdAt: now, updatedAt: now })
    .returning();
  return c.json(source, 201);
});

app.get('/:id', async (c) => {
  const [source] = await db
    .select()
    .from(schema.rentalSources)
    .where(eq(schema.rentalSources.id, c.req.param('id')))
    .limit(1);

  if (!source) return c.json({ error: 'Not found' }, 404);
  return c.json(source);
});

app.put('/:id', async (c) => {
  const body = await c.req.json();
  const [source] = await db
    .update(schema.rentalSources)
    .set({ ...body, updatedAt: nowISO() })
    .where(eq(schema.rentalSources.id, c.req.param('id')))
    .returning();

  if (!source) return c.json({ error: 'Not found' }, 404);
  return c.json(source);
});

app.delete('/:id', async (c) => {
  const result = await db
    .delete(schema.rentalSources)
    .where(eq(schema.rentalSources.id, c.req.param('id')))
    .returning({ id: schema.rentalSources.id });

  if (result.length === 0) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

// Catalog item linking
app.get('/:id/catalog', async (c) => {
  const rows = await db
    .select()
    .from(schema.catalogRentalSources)
    .where(eq(schema.catalogRentalSources.rentalSourceId, c.req.param('id')));
  return c.json(rows);
});

app.post('/:id/catalog/:catalogId', async (c) => {
  await db
    .insert(schema.catalogRentalSources)
    .values({ rentalSourceId: c.req.param('id'), catalogItemId: c.req.param('catalogId') })
    .onConflictDoNothing();
  return c.json({ ok: true }, 201);
});

app.delete('/:id/catalog/:catalogId', async (c) => {
  await db
    .delete(schema.catalogRentalSources)
    .where(
      and(
        eq(schema.catalogRentalSources.rentalSourceId, c.req.param('id')),
        eq(schema.catalogRentalSources.catalogItemId, c.req.param('catalogId')),
      ),
    );
  return c.json({ ok: true });
});

export default app;
