import { api } from './client';
import type { DayListModification } from '@/types/models';

// Populated by shooting-days.ts when days are loaded, so we can resolve projectId from dayId.
const _dayToProject = new Map<string, string>();

export function registerDayProject(dayId: string, projectId: string): void {
  _dayToProject.set(dayId, projectId);
}

export async function getAll(): Promise<DayListModification[]> {
  return [];
}

export async function getById(_id: string): Promise<DayListModification | undefined> {
  return undefined;
}

export async function getByDayId(dayId: string): Promise<DayListModification[]> {
  const projectId = _dayToProject.get(dayId);
  if (!projectId) return [];
  return api.get<DayListModification[]>(`/projects/${projectId}/days/${dayId}/modifications`);
}

export async function create(data: Omit<DayListModification, 'id' | 'createdAt' | 'updatedAt'>): Promise<DayListModification> {
  // Flat endpoint — no projectId needed in URL
  return api.post<DayListModification>('/day-modifications', data);
}

export async function update(id: string, data: Partial<Omit<DayListModification, 'id' | 'createdAt'>>): Promise<DayListModification | undefined> {
  return api.put<DayListModification>(`/day-modifications/${id}`, data).catch(() => undefined);
}

export async function remove(id: string): Promise<void> {
  await api.delete(`/day-modifications/${id}`);
}
