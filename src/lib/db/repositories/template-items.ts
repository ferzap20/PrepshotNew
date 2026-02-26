import { getDB } from '../connection';
import type { TemplateItem } from '@/types/models';
import { generateId } from '@/lib/utils/id';

export async function getAll(): Promise<TemplateItem[]> {
  const db = await getDB();
  return db.getAll('template_items');
}

export async function getById(id: string): Promise<TemplateItem | undefined> {
  const db = await getDB();
  return db.get('template_items', id);
}

export async function getByTemplateId(templateId: string): Promise<TemplateItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('template_items', 'by-templateId', templateId);
}

export async function create(data: Omit<TemplateItem, 'id'>): Promise<TemplateItem> {
  const db = await getDB();
  const item: TemplateItem = { ...data, id: generateId() };
  await db.put('template_items', item);
  return item;
}

export async function update(id: string, data: Partial<Omit<TemplateItem, 'id'>>): Promise<TemplateItem | undefined> {
  const db = await getDB();
  const existing = await db.get('template_items', id);
  if (!existing) return undefined;
  const updated: TemplateItem = { ...existing, ...data };
  await db.put('template_items', updated);
  return updated;
}

export async function remove(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('template_items', id);
}
