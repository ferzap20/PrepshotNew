import { getDB } from '../connection';
import type { ProjectMember } from '@/types/models';
import { generateId } from '@/lib/utils/id';
import { nowISO } from '@/lib/utils/date';

export async function getAll(): Promise<ProjectMember[]> {
  const db = await getDB();
  return db.getAll('project_members');
}

export async function getById(id: string): Promise<ProjectMember | undefined> {
  const db = await getDB();
  return db.get('project_members', id);
}

export async function getByProjectId(projectId: string): Promise<ProjectMember[]> {
  const db = await getDB();
  return db.getAllFromIndex('project_members', 'by-projectId', projectId);
}

export async function getByUserId(userId: string): Promise<ProjectMember[]> {
  const db = await getDB();
  return db.getAllFromIndex('project_members', 'by-userId', userId);
}

export async function create(
  data: Omit<ProjectMember, 'id' | 'joinedAt' | 'updatedAt'>,
): Promise<ProjectMember> {
  const db = await getDB();
  const now = nowISO();
  const member: ProjectMember = { ...data, id: generateId(), joinedAt: now, updatedAt: now };
  await db.put('project_members', member);
  return member;
}

export async function update(
  id: string,
  data: Partial<Omit<ProjectMember, 'id' | 'joinedAt'>>,
): Promise<ProjectMember | undefined> {
  const db = await getDB();
  const existing = await db.get('project_members', id);
  if (!existing) return undefined;
  const updated: ProjectMember = { ...existing, ...data, updatedAt: nowISO() };
  await db.put('project_members', updated);
  return updated;
}

export async function remove(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('project_members', id);
}
