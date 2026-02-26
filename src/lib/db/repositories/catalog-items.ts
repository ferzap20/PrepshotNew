import { getDB } from '../connection';
import type { CatalogItem } from '@/types/models';
import type { CatalogCategory } from '@/types/enums';
import { generateId } from '@/lib/utils/id';
import { nowISO } from '@/lib/utils/date';

export async function getAll(): Promise<CatalogItem[]> {
  const db = await getDB();
  return db.getAll('catalog_items');
}

export async function getById(id: string): Promise<CatalogItem | undefined> {
  const db = await getDB();
  return db.get('catalog_items', id);
}

export async function getByCategory(category: CatalogCategory): Promise<CatalogItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('catalog_items', 'by-category', category);
}

export async function create(data: Omit<CatalogItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CatalogItem> {
  const db = await getDB();
  const now = nowISO();
  const item: CatalogItem = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  await db.put('catalog_items', item);
  return item;
}

export async function update(id: string, data: Partial<Omit<CatalogItem, 'id' | 'createdAt'>>): Promise<CatalogItem | undefined> {
  const db = await getDB();
  const existing = await db.get('catalog_items', id);
  if (!existing) return undefined;
  const updated: CatalogItem = { ...existing, ...data, updatedAt: nowISO() };
  await db.put('catalog_items', updated);
  return updated;
}

export async function remove(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('catalog_items', id);
}
