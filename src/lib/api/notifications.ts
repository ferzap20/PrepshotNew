import { api } from './client';
import type { Notification } from '@/types/models';

export async function getAll(): Promise<Notification[]> {
  return api.get<Notification[]>('/notifications');
}

export async function markAllRead(): Promise<void> {
  await api.post('/notifications/read-all');
}

export async function remove(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`);
}
