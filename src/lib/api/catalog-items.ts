import { api } from './client';
import type { CatalogItem } from '@/types/models';
import type { CatalogCategory } from '@/types/enums';

export async function getAll(): Promise<CatalogItem[]> {
  return api.get<CatalogItem[]>('/catalog');
}

export async function getById(id: string): Promise<CatalogItem | undefined> {
  return api.get<CatalogItem>(`/catalog/${id}`).catch(() => undefined);
}

export async function getByCategory(category: CatalogCategory): Promise<CatalogItem[]> {
  const all = await getAll();
  return all.filter((item) => item.category === category);
}

export async function create(data: Omit<CatalogItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CatalogItem> {
  return api.post<CatalogItem>('/admin/catalog', data);
}

export async function update(id: string, data: Partial<Omit<CatalogItem, 'id' | 'createdAt'>>): Promise<CatalogItem | undefined> {
  return api.put<CatalogItem>(`/admin/catalog/${id}`, data).catch(() => undefined);
}

export async function remove(id: string): Promise<void> {
  await api.delete(`/admin/catalog/${id}`);
}
