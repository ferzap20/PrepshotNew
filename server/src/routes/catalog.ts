import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/connection.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import { generateId, nowISO } from '../lib/utils.js';

// Public catalog routes (read-only, no auth required)
export const catalogPublicApp = new Hono();

catalogPublicApp.get('/', async (c) => {
  const rows = await db.select().from(schema.catalogItems);
  return c.json(rows);
});

catalogPublicApp.get('/:id', async (c) => {
  const [item] = await db
    .select()
    .from(schema.catalogItems)
    .where(eq(schema.catalogItems.id, c.req.param('id')))
    .limit(1);

  if (!item) return c.json({ error: 'Not found' }, 404);
  return c.json(item);
});

// Admin catalog routes (write operations)
export const catalogAdminApp = new Hono();
catalogAdminApp.use('/*', authMiddleware);
catalogAdminApp.use('/*', adminMiddleware);

catalogAdminApp.post('/', async (c) => {
  const body = await c.req.json();
  const now = nowISO();
  const [item] = await db
    .insert(schema.catalogItems)
    .values({ id: body.id ?? generateId(), ...body, createdAt: now, updatedAt: now })
    .returning();
  return c.json(item, 201);
});

catalogAdminApp.put('/:id', async (c) => {
  const body = await c.req.json();
  const [item] = await db
    .update(schema.catalogItems)
    .set({ ...body, updatedAt: nowISO() })
    .where(eq(schema.catalogItems.id, c.req.param('id')))
    .returning();

  if (!item) return c.json({ error: 'Not found' }, 404);
  return c.json(item);
});

catalogAdminApp.delete('/:id', async (c) => {
  const result = await db
    .delete(schema.catalogItems)
    .where(eq(schema.catalogItems.id, c.req.param('id')))
    .returning({ id: schema.catalogItems.id });

  if (result.length === 0) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

// Batch import — accepts the same JSON format as the gear JSON files
const gearJsonItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().default(''),
  category: z.enum(['Camera', 'Lens', 'Cable', 'Accessory', 'Grip', 'Lighting', 'Audio']),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  mount: z.string().optional(),
  specs: z.record(z.unknown()).optional(),
  weight_kg: z.number().optional(),
  connectors: z.array(z.string()).optional(),
  compatibility: z.array(z.string()).optional(),
  source: z.string().optional(),
});

catalogAdminApp.post('/import', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!Array.isArray(body)) return c.json({ error: 'Expected a JSON array' }, 400);

  const now = nowISO();
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const raw of body) {
    const parsed = gearJsonItemSchema.safeParse(raw);
    if (!parsed.success) {
      errors.push(`Item "${raw?.id ?? 'unknown'}": ${parsed.error.issues[0]?.message}`);
      continue;
    }

    const item = parsed.data;
    const existing = await db
      .select({ id: schema.catalogItems.id })
      .from(schema.catalogItems)
      .where(eq(schema.catalogItems.id, item.id))
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    await db.insert(schema.catalogItems).values({
      id: item.id,
      name: item.name,
      brand: item.brand,
      category: item.category,
      description: item.description ?? '',
      aliases: [],
      compatibilityNotes: item.compatibility?.join(', ') ?? '',
      imageUrl: null,
      subcategory: item.subcategory,
      mount: item.mount,
      specs: item.specs,
      weightKg: item.weight_kg,
      connectors: item.connectors,
      source: item.source,
      createdAt: now,
      updatedAt: now,
    });

    created++;
  }

  return c.json({ created, skipped, errors });
});
