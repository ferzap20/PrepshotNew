import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateId, nowISO } from '../lib/utils.js';

async function notify(userId: string, type: string, projectId: string, message: string) {
  try {
    await db.insert(schema.notifications).values({
      id: generateId(),
      userId,
      type,
      projectId,
      message,
      read: false,
      createdAt: nowISO(),
    });
  } catch (err) {
    // Don't let notification failures break the main operation
    console.error('Failed to create notification:', err);
  }
}

const app = new Hono();
app.use('/*', authMiddleware);

// ---------------------------------------------------------------------------
// Projects CRUD
// ---------------------------------------------------------------------------

app.get('/', async (c) => {
  const { userId } = c.get('user');

  const owned = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.userId, userId));

  const memberships = await db
    .select({ project: schema.projects })
    .from(schema.projectMembers)
    .innerJoin(schema.projects, eq(schema.projectMembers.projectId, schema.projects.id))
    .where(eq(schema.projectMembers.userId, userId));

  const memberProjects = memberships.map(({ project }) => project);
  const ownedIds = new Set(owned.map((p) => p.id));
  const combined = [
    ...owned.map((p) => ({ ...p, isMember: false })),
    ...memberProjects.filter((p) => !ownedIds.has(p.id)).map((p) => ({ ...p, isMember: true })),
  ];
  return c.json(combined);
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
  const projectId = c.req.param('id');

  const [project] = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, projectId))
    .limit(1);

  if (!project) return c.json({ error: 'Not found' }, 404);

  // Allow owner or project member
  if (project.userId !== userId) {
    const [membership] = await db
      .select()
      .from(schema.projectMembers)
      .where(and(eq(schema.projectMembers.projectId, projectId), eq(schema.projectMembers.userId, userId)))
      .limit(1);
    if (!membership) return c.json({ error: 'Not found' }, 404);
    return c.json({ ...project, isMember: true });
  }

  return c.json({ ...project, isMember: false });
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
  const { userId: actorId } = c.get('user');
  const body = await c.req.json();
  const projectId = c.req.param('projectId');
  const now = nowISO();

  const [member] = await db
    .insert(schema.projectMembers)
    .values({ id: generateId(), projectId, ...body, joinedAt: now, updatedAt: now })
    .returning();

  // Notify the new member
  const [[project], [actor]] = await Promise.all([
    db.select({ name: schema.projects.name }).from(schema.projects).where(eq(schema.projects.id, projectId)).limit(1),
    db.select({ name: schema.users.name, email: schema.users.email }).from(schema.users).where(eq(schema.users.id, actorId)).limit(1),
  ]);
  const actorName = actor?.name || actor?.email?.split('@')[0] || 'Someone';
  await notify(body.userId, 'added_to_project', projectId, `${actorName} added you to "${project?.name ?? 'a project'}"`);

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
  const { userId: actorId } = c.get('user');
  const projectId = c.req.param('projectId');

  // Fetch member before deleting
  const [memberRow] = await db
    .select({ userId: schema.projectMembers.userId })
    .from(schema.projectMembers)
    .where(
      and(
        eq(schema.projectMembers.id, c.req.param('memberId')),
        eq(schema.projectMembers.projectId, projectId),
      ),
    )
    .limit(1);

  await db
    .delete(schema.projectMembers)
    .where(
      and(
        eq(schema.projectMembers.id, c.req.param('memberId')),
        eq(schema.projectMembers.projectId, projectId),
      ),
    );

  if (memberRow) {
    const [[project], [actor]] = await Promise.all([
      db.select({ name: schema.projects.name }).from(schema.projects).where(eq(schema.projects.id, projectId)).limit(1),
      db.select({ name: schema.users.name, email: schema.users.email }).from(schema.users).where(eq(schema.users.id, actorId)).limit(1),
    ]);
    const actorName = actor?.name || actor?.email?.split('@')[0] || 'Someone';
    await notify(memberRow.userId, 'removed_from_project', projectId, `${actorName} removed you from "${project?.name ?? 'a project'}"`);
  }

  return c.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Project Invitations
// ---------------------------------------------------------------------------

app.get('/:projectId/invitations', async (c) => {
  const rows = await db
    .select()
    .from(schema.projectInvitations)
    .where(eq(schema.projectInvitations.projectId, c.req.param('projectId')));
  return c.json(rows);
});

app.post('/:projectId/invitations', async (c) => {
  const { userId } = c.get('user');
  const { email } = await c.req.json<{ email: string }>();
  const normalised = email.toLowerCase().trim();

  const existing = await db
    .select()
    .from(schema.projectInvitations)
    .where(
      and(
        eq(schema.projectInvitations.projectId, c.req.param('projectId')),
        eq(schema.projectInvitations.email, normalised),
      ),
    )
    .limit(1);
  if (existing.length > 0) return c.json(existing[0]);

  const [inv] = await db
    .insert(schema.projectInvitations)
    .values({ id: generateId(), projectId: c.req.param('projectId'), email: normalised, invitedBy: userId, createdAt: nowISO() })
    .returning();
  return c.json(inv, 201);
});

app.delete('/:projectId/invitations/:invId', async (c) => {
  await db
    .delete(schema.projectInvitations)
    .where(
      and(
        eq(schema.projectInvitations.id, c.req.param('invId')),
        eq(schema.projectInvitations.projectId, c.req.param('projectId')),
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
// List Item Comments
// ---------------------------------------------------------------------------

app.get('/:projectId/list-items/commented', async (c) => {
  const rows = await db
    .select({ listItemId: schema.listItemComments.listItemId })
    .from(schema.listItemComments)
    .where(eq(schema.listItemComments.projectId, c.req.param('projectId')));
  return c.json([...new Set(rows.map((r) => r.listItemId))]);
});

app.get('/:projectId/list-items/:itemId/comments', async (c) => {
  const rows = await db
    .select()
    .from(schema.listItemComments)
    .where(eq(schema.listItemComments.listItemId, c.req.param('itemId')));
  return c.json(rows);
});

app.post('/:projectId/list-items/:itemId/comments', async (c) => {
  const { userId } = c.get('user');
  const { text } = await c.req.json<{ text: string }>();
  const projectId = c.req.param('projectId');
  const itemId = c.req.param('itemId');

  const [comment] = await db
    .insert(schema.listItemComments)
    .values({
      id: generateId(),
      projectId,
      listItemId: itemId,
      userId,
      text: text.trim(),
      createdAt: nowISO(),
    })
    .returning();

  // Notify all other project members + owner
  const [project, actor, listItem] = await Promise.all([
    db.select({ name: schema.projects.name, ownerId: schema.projects.userId }).from(schema.projects).where(eq(schema.projects.id, projectId)).limit(1).then((r) => r[0]),
    db.select({ name: schema.users.name, email: schema.users.email }).from(schema.users).where(eq(schema.users.id, userId)).limit(1).then((r) => r[0]),
    db.select({ catalogItemId: schema.projectGeneralLists.catalogItemId }).from(schema.projectGeneralLists).where(eq(schema.projectGeneralLists.id, itemId)).limit(1).then((r) => r[0]),
  ]);

  const actorName = actor?.name || actor?.email?.split('@')[0] || 'Someone';
  const catalogItem = listItem ? await db.select({ name: schema.catalogItems.name }).from(schema.catalogItems).where(eq(schema.catalogItems.id, listItem.catalogItemId)).limit(1).then((r) => r[0]) : null;
  const itemName = catalogItem?.name ?? 'an item';
  const message = `${actorName} commented on "${itemName}" in "${project?.name ?? 'a project'}"`;

  const members = await db
    .select({ userId: schema.projectMembers.userId })
    .from(schema.projectMembers)
    .where(eq(schema.projectMembers.projectId, projectId));

  const recipientIds = new Set<string>();
  if (project?.ownerId && project.ownerId !== userId) recipientIds.add(project.ownerId);
  for (const m of members) {
    if (m.userId !== userId) recipientIds.add(m.userId);
  }

  await Promise.all(
    [...recipientIds].map((rid) => notify(rid, 'new_comment', projectId, message)),
  );

  return c.json(comment, 201);
});

app.delete('/:projectId/list-items/:itemId/comments', async (c) => {
  await db
    .delete(schema.listItemComments)
    .where(eq(schema.listItemComments.listItemId, c.req.param('itemId')));
  return c.json({ ok: true });
});

app.delete('/:projectId/list-items/:itemId/comments/:commentId', async (c) => {
  await db
    .delete(schema.listItemComments)
    .where(eq(schema.listItemComments.id, c.req.param('commentId')));
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
