import { getDB } from '../connection';
import type { ShootingDay } from '@/types/models';
import { generateId } from '@/lib/utils/id';
import { nowISO } from '@/lib/utils/date';

export async function getAll(): Promise<ShootingDay[]> {
  const db = await getDB();
  return db.getAll('shooting_days');
}

export async function getById(id: string): Promise<ShootingDay | undefined> {
  const db = await getDB();
  return db.get('shooting_days', id);
}

export async function getByProjectId(projectId: string): Promise<ShootingDay[]> {
  const db = await getDB();
  return db.getAllFromIndex('shooting_days', 'by-projectId', projectId);
}

export async function create(data: Omit<ShootingDay, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShootingDay> {
  const db = await getDB();
  const now = nowISO();
  const day: ShootingDay = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  await db.put('shooting_days', day);
  return day;
}

export async function update(id: string, data: Partial<Omit<ShootingDay, 'id' | 'createdAt'>>): Promise<ShootingDay | undefined> {
  const db = await getDB();
  const existing = await db.get('shooting_days', id);
  if (!existing) return undefined;
  const updated: ShootingDay = { ...existing, ...data, updatedAt: nowISO() };
  await db.put('shooting_days', updated);
  return updated;
}

export async function remove(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('shooting_days', id);
}
