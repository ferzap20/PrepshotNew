import { getDB } from '../connection';
import type { RentalSource } from '@/types/models';
import { generateId } from '@/lib/utils/id';
import { nowISO } from '@/lib/utils/date';

export async function getAll(): Promise<RentalSource[]> {
  const db = await getDB();
  return db.getAll('rental_sources');
}

export async function getById(id: string): Promise<RentalSource | undefined> {
  const db = await getDB();
  return db.get('rental_sources', id);
}

export async function create(data: Omit<RentalSource, 'id' | 'createdAt' | 'updatedAt'>): Promise<RentalSource> {
  const db = await getDB();
  const now = nowISO();
  const source: RentalSource = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  await db.put('rental_sources', source);
  return source;
}

export async function update(id: string, data: Partial<Omit<RentalSource, 'id' | 'createdAt'>>): Promise<RentalSource | undefined> {
  const db = await getDB();
  const existing = await db.get('rental_sources', id);
  if (!existing) return undefined;
  const updated: RentalSource = { ...existing, ...data, updatedAt: nowISO() };
  await db.put('rental_sources', updated);
  return updated;
}

export async function remove(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('rental_sources', id);
}
