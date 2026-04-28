import { api } from './client';
import type { DailyDocument } from '@/types/models';

// Daily documents are cascade-deleted when their parent project/day is deleted.
// The only usage in the codebase is in DeleteProjectDialog, which pre-deletes docs
// before deleting the project. With cascade deletes on the server, this is redundant,
// so we return empty lists and no-op removes safely.

export async function getAll(): Promise<DailyDocument[]> {
  return [];
}

export async function getById(_id: string): Promise<DailyDocument | undefined> {
  return undefined;
}

export async function getByDayId(_dayId: string): Promise<DailyDocument[]> {
  return [];
}

export async function create(data: Omit<DailyDocument, 'id' | 'createdAt'>): Promise<DailyDocument> {
  return api.post<DailyDocument>(`/documents`, data);
}

export async function remove(_id: string): Promise<void> {
  // No-op: server cascade deletes handle this when parent project/day is removed.
}
