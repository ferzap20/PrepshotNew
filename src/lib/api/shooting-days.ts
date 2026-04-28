import { api } from './client';
import type { ShootingDay } from '@/types/models';
import { registerDayProject } from './day-list-modifications';

// Module-level cache: day.id → day (populated by getByProjectId)
const _cache = new Map<string, ShootingDay>();

export async function getAll(): Promise<ShootingDay[]> {
  return [];
}

export async function getById(id: string): Promise<ShootingDay | undefined> {
  return _cache.get(id);
}

export async function getByProjectId(projectId: string): Promise<ShootingDay[]> {
  const days = await api.get<ShootingDay[]>(`/projects/${projectId}/days`);
  days.forEach((d) => {
    _cache.set(d.id, d);
    registerDayProject(d.id, projectId); // allows day-list-modifications to resolve projectId
  });
  return days;
}

export async function create(data: Omit<ShootingDay, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShootingDay> {
  const day = await api.post<ShootingDay>(`/projects/${data.projectId}/days`, data);
  _cache.set(day.id, day);
  registerDayProject(day.id, data.projectId);
  return day;
}

export async function update(id: string, data: Partial<Omit<ShootingDay, 'id' | 'createdAt'>>): Promise<ShootingDay | undefined> {
  const cached = _cache.get(id);
  const projectId = data.projectId ?? cached?.projectId;
  if (!projectId) return undefined;

  const day = await api.put<ShootingDay>(`/projects/${projectId}/days/${id}`, data).catch(() => undefined);
  if (day) _cache.set(day.id, day);
  return day;
}

export async function remove(id: string): Promise<void> {
  const cached = _cache.get(id);
  if (!cached) return;
  await api.delete(`/projects/${cached.projectId}/days/${id}`);
  _cache.delete(id);
}
