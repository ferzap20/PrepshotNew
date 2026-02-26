import { getDB } from '../connection';
import type { User } from '@/types/models';
import { generateId } from '@/lib/utils/id';
import { nowISO } from '@/lib/utils/date';

export async function getAll(): Promise<User[]> {
  const db = await getDB();
  return db.getAll('users');
}

export async function getById(id: string): Promise<User | undefined> {
  const db = await getDB();
  return db.get('users', id);
}

export async function getByEmail(email: string): Promise<User | undefined> {
  const db = await getDB();
  return db.getFromIndex('users', 'by-email', email);
}

export async function create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const db = await getDB();
  const now = nowISO();
  const user: User = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  await db.put('users', user);
  return user;
}

export async function update(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | undefined> {
  const db = await getDB();
  const existing = await db.get('users', id);
  if (!existing) return undefined;
  const updated: User = { ...existing, ...data, updatedAt: nowISO() };
  await db.put('users', updated);
  return updated;
}

export async function remove(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('users', id);
}
