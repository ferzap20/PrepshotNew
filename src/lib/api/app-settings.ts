import { api, ApiError } from './client';
import type { AppSetting } from '@/types/models';

export async function get(key: string): Promise<AppSetting | undefined> {
  const all = await getAll();
  return all.find((s) => s.key === key);
}

export async function set(key: string, value: string): Promise<AppSetting> {
  const result = await api.put<{ key: string; value: string }>(`/settings/${key}`, { value });
  return { key: result.key, value: result.value, updatedAt: new Date().toISOString() };
}

export async function getAll(): Promise<AppSetting[]> {
  try {
    const map = await api.get<Record<string, string>>('/settings');
    const now = new Date().toISOString();
    return Object.entries(map).map(([key, value]) => ({ key, value, updatedAt: now }));
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return [];
    throw err;
  }
}

export async function remove(key: string): Promise<void> {
  await api.delete(`/settings/${key}`);
}
