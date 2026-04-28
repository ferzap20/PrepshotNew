import { api } from './client';
import type { PackageTemplate } from '@/types/models';

export async function getAll(): Promise<PackageTemplate[]> {
  return api.get<PackageTemplate[]>('/templates');
}

export async function getById(id: string): Promise<PackageTemplate | undefined> {
  return api.get<PackageTemplate>(`/templates/${id}`).catch(() => undefined);
}

// userId param ignored — server returns current user's templates from JWT
export async function getByUserId(_userId: string): Promise<PackageTemplate[]> {
  return api.get<PackageTemplate[]>('/templates');
}

export async function create(data: Omit<PackageTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PackageTemplate> {
  return api.post<PackageTemplate>('/templates', data);
}

export async function update(id: string, data: Partial<Omit<PackageTemplate, 'id' | 'createdAt'>>): Promise<PackageTemplate | undefined> {
  return api.put<PackageTemplate>(`/templates/${id}`, data).catch(() => undefined);
}

export async function remove(id: string): Promise<void> {
  await api.delete(`/templates/${id}`);
}
