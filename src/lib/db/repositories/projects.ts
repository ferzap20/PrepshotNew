import { getDB } from '../connection';
import type { Project } from '@/types/models';
import { generateId } from '@/lib/utils/id';
import { nowISO } from '@/lib/utils/date';

export async function getAll(): Promise<Project[]> {
  const db = await getDB();
  return db.getAll('projects');
}

export async function getById(id: string): Promise<Project | undefined> {
  const db = await getDB();
  return db.get('projects', id);
}

export async function getByUserId(userId: string): Promise<Project[]> {
  const db = await getDB();
  return db.getAllFromIndex('projects', 'by-userId', userId);
}

export async function create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const db = await getDB();
  const now = nowISO();
  const project: Project = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  await db.put('projects', project);
  return project;
}

export async function update(id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | undefined> {
  const db = await getDB();
  const existing = await db.get('projects', id);
  if (!existing) return undefined;
  const updated: Project = { ...existing, ...data, updatedAt: nowISO() };
  await db.put('projects', updated);
  return updated;
}

export async function remove(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('projects', id);
}

export async function duplicate(id: string, userId: string): Promise<Project | undefined> {
  const db = await getDB();
  const existing = await db.get('projects', id);
  if (!existing) return undefined;
  
  const now = nowISO();
  const newProject: Project = {
    ...existing,
    id: generateId(),
    userId,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('projects', newProject);
  return newProject;
}
