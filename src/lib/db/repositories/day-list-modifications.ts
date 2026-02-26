import { getDB } from '../connection';
import type { DayListModification } from '@/types/models';
import { generateId } from '@/lib/utils/id';
import { nowISO } from '@/lib/utils/date';

export async function getAll(): Promise<DayListModification[]> {
  const db = await getDB();
  return db.getAll('day_list_modifications');
}

export async function getById(id: string): Promise<DayListModification | undefined> {
  const db = await getDB();
  return db.get('day_list_modifications', id);
}

export async function getByDayId(dayId: string): Promise<DayListModification[]> {
  const db = await getDB();
  return db.getAllFromIndex('day_list_modifications', 'by-dayId', dayId);
}

export async function create(data: Omit<DayListModification, 'id' | 'createdAt' | 'updatedAt'>): Promise<DayListModification> {
  const db = await getDB();
  const now = nowISO();
  const mod: DayListModification = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  await db.put('day_list_modifications', mod);
  return mod;
}

export async function update(id: string, data: Partial<Omit<DayListModification, 'id' | 'createdAt'>>): Promise<DayListModification | undefined> {
  const db = await getDB();
  const existing = await db.get('day_list_modifications', id);
  if (!existing) return undefined;
  const updated: DayListModification = { ...existing, ...data, updatedAt: nowISO() };
  await db.put('day_list_modifications', updated);
  return updated;
}

export async function remove(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('day_list_modifications', id);
}
