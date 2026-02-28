import bcrypt from 'bcryptjs';
import { getDB } from '@/lib/db/connection';
import type { User } from '@/types/models';
import { UserRole } from '@/types/enums';
import { generateId } from '@/lib/utils/id';
import { nowISO } from '@/lib/utils/date';
import { validate, RegisterSchema } from '@/lib/validation';

const SALT_ROUNDS = 10;
const SESSION_KEY = 'prepshot_session';

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
}

export async function register(email: string, password: string): Promise<User> {
  validate(RegisterSchema, { email, password });
  const db = await getDB();
  const existing = await db.getFromIndex('users', 'by-email', email);
  if (existing) throw new Error('Email already registered');

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const now = nowISO();
  const user: User = {
    id: generateId(),
    email,
    passwordHash: hash,
    role: UserRole.User,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('users', user);
  return user;
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const db = await getDB();
  const user = await db.getFromIndex('users', 'by-email', email);
  if (!user) throw new Error('Invalid credentials');

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new Error('Invalid credentials');

  const session: AuthSession = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}
