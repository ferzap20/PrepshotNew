import { getDB } from '../connection';
import type { UserGearItem } from '@/types/models';
import { generateId } from '@/lib/utils/id';
import { nowISO } from '@/lib/utils/date';
import { validate, UserGearItemCreateSchema } from '@/lib/validation';

export async function getAll(): Promise<UserGearItem[]> {
  const db = await getDB();
  return db.getAll('user_gear');
}

export async function getById(id: string): Promise<UserGearItem | undefined> {
  const db = await getDB();
  return db.get('user_gear', id);
}

export async function getByUserId(userId: string): Promise<UserGearItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('user_gear', 'by-userId', userId);
}

export async function getByCatalogItemId(catalogItemId: string): Promise<UserGearItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('user_gear', 'by-catalogItemId', catalogItemId);
}

export async function create(
  data: Omit<UserGearItem, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<UserGearItem> {
  validate(UserGearItemCreateSchema, data);
  const db = await getDB();
  const now = nowISO();
  const item: UserGearItem = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  await db.put('user_gear', item);
  return item;
}

export async function update(
  id: string,
  data: Partial<Omit<UserGearItem, 'id' | 'createdAt'>>,
): Promise<UserGearItem | undefined> {
  const db = await getDB();
  const existing = await db.get('user_gear', id);
  if (!existing) return undefined;
  const updated: UserGearItem = { ...existing, ...data, updatedAt: nowISO() };
  await db.put('user_gear', updated);
  return updated;
}

export async function remove(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('user_gear', id);
}
