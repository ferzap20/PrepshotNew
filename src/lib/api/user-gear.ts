import { api } from './client';
import type { UserGearItem } from '@/types/models';

export async function getAll(): Promise<UserGearItem[]> {
  return api.get<UserGearItem[]>('/my-gear');
}

export async function getById(id: string): Promise<UserGearItem | undefined> {
  return api.get<UserGearItem>(`/my-gear/${id}`).catch(() => undefined);
}

// userId param ignored — server returns current user's gear from JWT
export async function getByUserId(_userId: string): Promise<UserGearItem[]> {
  return api.get<UserGearItem[]>('/my-gear');
}

export async function getByCatalogItemId(_catalogItemId: string): Promise<UserGearItem[]> {
  const all = await getAll();
  return all.filter((item) => item.catalogItemId === _catalogItemId);
}

export async function create(data: Omit<UserGearItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserGearItem> {
  return api.post<UserGearItem>('/my-gear', data);
}

export async function update(id: string, data: Partial<Omit<UserGearItem, 'id' | 'createdAt'>>): Promise<UserGearItem | undefined> {
  return api.put<UserGearItem>(`/my-gear/${id}`, data).catch(() => undefined);
}

export async function remove(id: string): Promise<void> {
  await api.delete(`/my-gear/${id}`);
}
