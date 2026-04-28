import { api } from './client';
import type { ProjectGeneralListItem } from '@/types/models';

export async function getAll(): Promise<ProjectGeneralListItem[]> {
  return [];
}

export async function getById(_id: string): Promise<ProjectGeneralListItem | undefined> {
  return undefined;
}

export async function getByProjectId(projectId: string): Promise<ProjectGeneralListItem[]> {
  return api.get<ProjectGeneralListItem[]>(`/projects/${projectId}/list-items`);
}

export async function create(data: Omit<ProjectGeneralListItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectGeneralListItem> {
  return api.post<ProjectGeneralListItem>(`/projects/${data.projectId}/list-items`, data);
}

export async function update(id: string, data: Partial<Omit<ProjectGeneralListItem, 'id' | 'createdAt'>>): Promise<ProjectGeneralListItem | undefined> {
  // Flat endpoint — no need for projectId in URL
  return api.put<ProjectGeneralListItem>(`/list-items/${id}`, data).catch(() => undefined);
}

export async function remove(id: string): Promise<void> {
  await api.delete(`/list-items/${id}`);
}
