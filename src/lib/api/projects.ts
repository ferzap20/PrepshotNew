import { api } from './client';
import type { Project } from '@/types/models';

export async function getAll(): Promise<Project[]> {
  return api.get<Project[]>('/projects');
}

export async function getById(id: string): Promise<Project | undefined> {
  return api.get<Project>(`/projects/${id}`).catch(() => undefined);
}

// userId param ignored — server infers user from JWT cookie
export async function getByUserId(_userId: string): Promise<Project[]> {
  return api.get<Project[]>('/projects');
}

export async function create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  return api.post<Project>('/projects', data);
}

export async function update(id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | undefined> {
  return api.put<Project>(`/projects/${id}`, data).catch(() => undefined);
}

export async function remove(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}

// userId param ignored — server uses JWT
export async function duplicate(id: string, _userId: string): Promise<Project | undefined> {
  return api.post<Project>(`/projects/${id}/duplicate`).catch(() => undefined);
}
