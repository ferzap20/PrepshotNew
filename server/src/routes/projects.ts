import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateId, nowISO } from '../lib/utils.js';

const app = new Hono();
app.use('/*', authMiddleware);

// ---------------------------------------------------------------------------
// Projects CRUD
// ---------------------------------------------------------------------------

app.get('/', async (c) => {
  const { userId } = c.get('user');
  const rows = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.userId, userId));
  return c.json(rows);
});

app.post('/', async (c) => {
  const { userId } = c.get('user');
  const body = await c.req.json();
  const now = nowISO();
  const id = generateId();

  const [project] = await db
    .insert(schema.projects)
    .values({ id, userId, ...body, createdAt: now, updatedAt: now })
    .returning();

  return c.json(project, 201);
});

app.get('/:id', async (c) => {
  const { userId } = c.get('user');
  const [project] = await db
    .select()
    .from(schema.projects)
    .where(and(eq(schema.projects.id, c.req.param('id')), eq(schema.projects.userId, userId)))
    .limit(1);

  if (!project) return c.json({ error: 'Not found' }, 404);
  return c.json(project);
});

app.put('/:id', async (c) => {
  const { userId } = c.get('user');
  const body = await c.req.json();

  const [project] = await db
    .update(schema.projects)
    .set({ ...body, updatedAt: nowISO() })
    .where(and(eq(schema.projects.id, c.req.param('id')), eq(schema.projects.userId, userId)))
    .returning();

  if (!project) return c.json({ error: 'Not found' }, 404);
  return c.json(project);
});

app.delete('/:id', async (c) => {
  const { userId } = c.get('user');
  const result = await db
    .delete(schema.projects)
    .where(and(eq(schema.projects.id, c.req.param('id')), eq(schema.projects.userId, userId)))
    .returning({ id: schema.projects.id });

  if (result.length === 0) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

app.post('/:id/duplicate', async (c) => {
  const { userId } = c.get('user');
  const [original] = await db
    .select()
    .from(schema.projects)
    .where(and(eq(schema.projects.id, c.req.param('id')), eq(schema.projects.userId, userId)))
    .limit(1);

  if (!original) return c.json({ error: 'Not found' }, 404);

  const now = nowISO();
  const newProjectId = generateId();

  const [newProject] = await db
    .insert(schema.projects)
    .values({ ...original, id: newProjectId, name: `${original.name} (Copy)`, createdAt: now, updatedAt: now })
    .returning();

  // Duplicate all list items for this project
  const listItems = await db
    .select()
    .from(schema.projectGeneralLists)
    .where(eq(schema.projectGeneralLists.projectId, original.id));

  if (listItems.length > 0) {
    await db.insert(schema.projectGeneralLists).values(
      listItems.map((item) => ({ ...item, id: generateId(), projectId: newProjectId, createdAt: now, updatedAt: now })),
    );
  }

  return c.json(newProject, 201);
});

// ---------------------------------------------------------------------------
// Project Members
// ---------------------------------------------------------------------------

app.get('/:projectId/members', async (c) => {
  const rows = await db
    .select()
    .from(schema.projectMembers)
    .where(eq(schema.projectMembers.projectId, c.req.param('projectId')));
  return c.json(rows);
});

app.post('/:projectId/members', async (c) => {
  const body = await c.req.json();
  const now = nowISO();
  const [member] = await db
    .insert(schema.projectMembers)
    .values({ id: generateId(), projectId: c.req.param('projectId'), ...body, joinedAt: now, updatedAt: now })
    .returning();
  return c.json(member, 201);
});

app.put('/:projectId/members/:memberId', async (c) => {
  const body = await c.req.json();
  const [member] = await db
    .update(schema.projectMembers)
    .set({ ...body, updatedAt: nowISO() })
    .where(
      and(
        eq(schema.projectMembers.id, c.req.param('memberId')),
        eq(schema.projectMembers.projectId, c.req.param('projectId')),
      ),
    )
    .returning();

  if (!member) return c.json({ error: 'Not found' }, 404);
  return c.json(member);
});

app.delete('/:projectId/members/:memberId', async (c) => {
  await db
    .delete(schema.projectMembers)
    .where(
      and(
        eq(schema.projectMembers.id, c.req.param('memberId')),
        eq(schema.projectMembers.projectId, c.req.param('projectId')),
      ),
    );
  return c.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Project General List Items
// ---------------------------------------------------------------------------

app.get('/:projectId/list-items', async (c) => {
  const rows = await db
    .select()
    .from(schema.projectGeneralLists)
    .where(eq(schema.projectGeneralLists.projectId, c.req.param('projectId')));
  return c.json(rows);
});

app.post('/:projectId/list-items', async (c) => {
  const { userId } = c.get('user');
  const body = await c.req.json();
  const now = nowISO();
  const [item] = await db
    .insert(schema.projectGeneralLists)
    .values({ id: generateId(), projectId: c.req.param('projectId'), userId, ...body, createdAt: now, updatedAt: now })
    .returning();
  return c.json(item, 201);
});

app.put('/:projectId/list-items/:itemId', async (c) => {
  const body = await c.req.json();
  const [item] = await db
    .update(schema.projectGeneralLists)
    .set({ ...body, updatedAt: nowISO() })
    .where(
      and(
        eq(schema.projectGeneralLists.id, c.req.param('itemId')),
        eq(schema.projectGeneralLists.projectId, c.req.param('projectId')),
      ),
    )
    .returning();

  if (!item) return c.json({ error: 'Not found' }, 404);
  return c.json(item);
});

app.delete('/:projectId/list-items/:itemId', async (c) => {
  await db
    .delete(schema.projectGeneralLists)
    .where(
      and(
        eq(schema.projectGeneralLists.id, c.req.param('itemId')),
        eq(schema.projectGeneralLists.projectId, c.req.param('projectId')),
      ),
    );
  return c.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Shooting Days
// ---------------------------------------------------------------------------

app.get('/:projectId/days', async (c) => {
  const rows = await db
    .select()
    .from(schema.shootingDays)
    .where(eq(schema.shootingDays.projectId, c.req.param('projectId')));
  return c.json(rows);
});

app.post('/:projectId/days', async (c) => {
  const body = await c.req.json();
  const now = nowISO();
  const [day] = await db
    .insert(schema.shootingDays)
    .values({ id: generateId(), projectId: c.req.param('projectId'), ...body, createdAt: now, updatedAt: now })
    .returning();
  return c.json(day, 201);
});

app.get('/:projectId/days/:dayId', async (c) => {
  const [day] = await db
    .select()
    .from(schema.shootingDays)
    .where(
      and(
        eq(schema.shootingDays.id, c.req.param('dayId')),
        eq(schema.shootingDays.projectId, c.req.param('projectId')),
      ),
    )
    .limit(1);

  if (!day) return c.json({ error: 'Not found' }, 404);
  return c.json(day);
});

app.put('/:projectId/days/:dayId', async (c) => {
  const body = await c.req.json();
  const [day] = await db
    .update(schema.shootingDays)
    .set({ ...body, updatedAt: nowISO() })
    .where(
      and(
        eq(schema.shootingDays.id, c.req.param('dayId')),
        eq(schema.shootingDays.projectId, c.req.param('projectId')),
      ),
    )
    .returning();

  if (!day) return c.json({ error: 'Not found' }, 404);
  return c.json(day);
});

app.delete('/:projectId/days/:dayId', async (c) => {
  await db
    .delete(schema.shootingDays)
    .where(
      and(
        eq(schema.shootingDays.id, c.req.param('dayId')),
        eq(schema.shootingDays.projectId, c.req.param('projectId')),
      ),
    );
  return c.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Day List Modifications
// ---------------------------------------------------------------------------

app.get('/:projectId/days/:dayId/modifications', async (c) => {
  const rows = await db
    .select()
    .from(schema.dayListModifications)
    .where(eq(schema.dayListModifications.dayId, c.req.param('dayId')));
  return c.json(rows);
});

app.post('/:projectId/days/:dayId/modifications', async (c) => {
  const body = await c.req.json();
  const now = nowISO();
  const [mod] = await db
    .insert(schema.dayListModifications)
    .values({ id: generateId(), dayId: c.req.param('dayId'), ...body, createdAt: now, updatedAt: now })
    .returning();
  return c.json(mod, 201);
});

app.put('/:projectId/days/:dayId/modifications/:modId', async (c) => {
  const body = await c.req.json();
  const [mod] = await db
    .update(schema.dayListModifications)
    .set({ ...body, updatedAt: nowISO() })
    .where(
      and(
        eq(schema.dayListModifications.id, c.req.param('modId')),
        eq(schema.dayListModifications.dayId, c.req.param('dayId')),
      ),
    )
    .returning();

  if (!mod) return c.json({ error: 'Not found' }, 404);
  return c.json(mod);
});

app.delete('/:projectId/days/:dayId/modifications/:modId', async (c) => {
  await db
    .delete(schema.dayListModifications)
    .where(
      and(
        eq(schema.dayListModifications.id, c.req.param('modId')),
        eq(schema.dayListModifications.dayId, c.req.param('dayId')),
      ),
    );
  return c.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Daily Documents
// ---------------------------------------------------------------------------

app.get('/:projectId/days/:dayId/documents', async (c) => {
  const rows = await db
    .select()
    .from(schema.dailyDocuments)
    .where(eq(schema.dailyDocuments.dayId, c.req.param('dayId')));
  return c.json(rows);
});

app.post('/:projectId/days/:dayId/documents', async (c) => {
  const body = await c.req.json();
  const [doc] = await db
    .insert(schema.dailyDocuments)
    .values({ id: generateId(), dayId: c.req.param('dayId'), ...body, createdAt: nowISO() })
    .returning();
  return c.json(doc, 201);
});

app.delete('/:projectId/days/:dayId/documents/:docId', async (c) => {
  await db
    .delete(schema.dailyDocuments)
    .where(
      and(
        eq(schema.dailyDocuments.id, c.req.param('docId')),
        eq(schema.dailyDocuments.dayId, c.req.param('dayId')),
      ),
    );
  return c.json({ ok: true });
});

export default app;
