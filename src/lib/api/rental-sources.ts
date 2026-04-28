import { api } from './client';
import type { RentalSource } from '@/types/models';

export async function getAll(): Promise<RentalSource[]> {
  return api.get<RentalSource[]>('/rental-sources');
}

export async function getById(id: string): Promise<RentalSource | undefined> {
  return api.get<RentalSource>(`/rental-sources/${id}`).catch(() => undefined);
}

export async function create(data: Omit<RentalSource, 'id' | 'createdAt' | 'updatedAt'>): Promise<RentalSource> {
  return api.post<RentalSource>('/rental-sources', data);
}

export async function update(id: string, data: Partial<Omit<RentalSource, 'id' | 'createdAt'>>): Promise<RentalSource | undefined> {
  return api.put<RentalSource>(`/rental-sources/${id}`, data).catch(() => undefined);
}

export async function remove(id: string): Promise<void> {
  await api.delete(`/rental-sources/${id}`);
}
