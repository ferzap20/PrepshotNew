import { Hono } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '../db/connection.js';
import * as schema from '../db/schema.js';
import { authMiddleware, signToken } from '../middleware/auth.js';
import { generateId, nowISO } from '../lib/utils.js';

const app = new Hono();

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

app.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Invalid request' }, 400);

  const { email, password } = parsed.data;
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()))
    .limit(1);

  if (!user) return c.json({ error: 'Invalid credentials' }, 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return c.json({ error: 'Invalid credentials' }, 401);

  const token = await signToken({
    userId: user.id,
    email: user.email,
    role: user.role as 'admin' | 'user',
  });

  setCookie(c, 'token', token, cookieOpts);

  return c.json({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name ?? undefined,
  });
});

app.post('/register', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Invalid request' }, 400);

  const { email, password, name } = parsed.data;
  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()))
    .limit(1);

  if (existing.length > 0) return c.json({ error: 'Email already in use' }, 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const now = nowISO();
  const id = generateId();

  await db.insert(schema.users).values({
    id,
    email: email.toLowerCase(),
    passwordHash,
    role: 'user',
    name: name ?? null,
    createdAt: now,
    updatedAt: now,
  });

  const token = await signToken({ userId: id, email: email.toLowerCase(), role: 'user' });
  setCookie(c, 'token', token, cookieOpts);

  return c.json({ id, email: email.toLowerCase(), role: 'user', name: name ?? undefined }, 201);
});

app.post('/logout', (c) => {
  deleteCookie(c, 'token', { path: '/' });
  return c.json({ ok: true });
});

app.get('/me', authMiddleware, async (c) => {
  const { userId } = c.get('user');
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!user) return c.json({ error: 'Not found' }, 404);
  return c.json({ id: user.id, email: user.email, role: user.role, name: user.name ?? undefined });
});

export default app;
