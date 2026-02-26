import { getDB } from '../connection';
import type { PackageTemplate } from '@/types/models';
import { generateId } from '@/lib/utils/id';
import { nowISO } from '@/lib/utils/date';

export async function getAll(): Promise<PackageTemplate[]> {
  const db = await getDB();
  return db.getAll('package_templates');
}

export async function getById(id: string): Promise<PackageTemplate | undefined> {
  const db = await getDB();
  return db.get('package_templates', id);
}

export async function getByUserId(userId: string): Promise<PackageTemplate[]> {
  const db = await getDB();
  return db.getAllFromIndex('package_templates', 'by-userId', userId);
}

export async function create(data: Omit<PackageTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PackageTemplate> {
  const db = await getDB();
  const now = nowISO();
  const template: PackageTemplate = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  await db.put('package_templates', template);
  return template;
}

export async function update(id: string, data: Partial<Omit<PackageTemplate, 'id' | 'createdAt'>>): Promise<PackageTemplate | undefined> {
  const db = await getDB();
  const existing = await db.get('package_templates', id);
  if (!existing) return undefined;
  const updated: PackageTemplate = { ...existing, ...data, updatedAt: nowISO() };
  await db.put('package_templates', updated);
  return updated;
}

export async function remove(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('package_templates', id);
}
