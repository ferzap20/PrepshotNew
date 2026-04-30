import { api } from './client';
import type { ListItemComment } from '@/types/models';

export async function getCommentedItemIds(projectId: string): Promise<string[]> {
  return api.get<string[]>(`/projects/${projectId}/list-items/commented`);
}

export async function getByItemId(projectId: string, itemId: string): Promise<ListItemComment[]> {
  return api.get<ListItemComment[]>(`/projects/${projectId}/list-items/${itemId}/comments`);
}

export async function create(projectId: string, itemId: string, text: string): Promise<ListItemComment> {
  return api.post<ListItemComment>(`/projects/${projectId}/list-items/${itemId}/comments`, { text });
}

export async function remove(projectId: string, itemId: string, commentId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/list-items/${itemId}/comments/${commentId}`);
}

export async function removeAll(projectId: string, itemId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/list-items/${itemId}/comments`);
}
