import { api } from './client';
import type { TemplateItem } from '@/types/models';

export async function getAll(): Promise<TemplateItem[]> {
  return [];
}

export async function getById(_id: string): Promise<TemplateItem | undefined> {
  return undefined;
}

export async function getByTemplateId(templateId: string): Promise<TemplateItem[]> {
  return api.get<TemplateItem[]>(`/templates/${templateId}/items`);
}

export async function create(data: Omit<TemplateItem, 'id'>): Promise<TemplateItem> {
  return api.post<TemplateItem>(`/templates/${data.templateId}/items`, data);
}

export async function update(id: string, data: Partial<Omit<TemplateItem, 'id'>>): Promise<TemplateItem | undefined> {
  const templateId = data.templateId;
  if (!templateId) return undefined;
  return api.put<TemplateItem>(`/templates/${templateId}/items/${id}`, data).catch(() => undefined);
}

export async function remove(id: string): Promise<void> {
  await api.delete(`/template-items/${id}`);
}
