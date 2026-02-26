import { getDB } from '../connection';
import type { ProjectGeneralListItem } from '@/types/models';
import { generateId } from '@/lib/utils/id';
import { nowISO } from '@/lib/utils/date';

export async function getAll(): Promise<ProjectGeneralListItem[]> {
  const db = await getDB();
  return db.getAll('project_general_lists');
}

export async function getById(id: string): Promise<ProjectGeneralListItem | undefined> {
  const db = await getDB();
  return db.get('project_general_lists', id);
}

export async function getByProjectId(projectId: string): Promise<ProjectGeneralListItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('project_general_lists', 'by-projectId', projectId);
}

export async function create(data: Omit<ProjectGeneralListItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectGeneralListItem> {
  const db = await getDB();
  const now = nowISO();
  const item: ProjectGeneralListItem = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  await db.put('project_general_lists', item);
  return item;
}

export async function update(id: string, data: Partial<Omit<ProjectGeneralListItem, 'id' | 'createdAt'>>): Promise<ProjectGeneralListItem | undefined> {
  const db = await getDB();
  const existing = await db.get('project_general_lists', id);
  if (!existing) return undefined;
  const updated: ProjectGeneralListItem = { ...existing, ...data, updatedAt: nowISO() };
  await db.put('project_general_lists', updated);
  return updated;
}

export async function remove(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('project_general_lists', id);
}
