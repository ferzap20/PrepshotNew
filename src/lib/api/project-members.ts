import { api } from './client';
import type { ProjectMember } from '@/types/models';

// Module-level cache: member.id → member (populated by getByProjectId)
const _cache = new Map<string, ProjectMember>();

export async function getAll(): Promise<ProjectMember[]> {
  return [];
}

export async function getById(id: string): Promise<ProjectMember | undefined> {
  return _cache.get(id);
}

export async function getByProjectId(projectId: string): Promise<ProjectMember[]> {
  const members = await api.get<ProjectMember[]>(`/projects/${projectId}/members`);
  members.forEach((m) => _cache.set(m.id, m));
  return members;
}

export async function getByUserId(_userId: string): Promise<ProjectMember[]> {
  return [];
}

export async function create(data: Omit<ProjectMember, 'id' | 'joinedAt' | 'updatedAt'>): Promise<ProjectMember> {
  const member = await api.post<ProjectMember>(`/projects/${data.projectId}/members`, data);
  _cache.set(member.id, member);
  return member;
}

export async function update(id: string, data: Partial<Omit<ProjectMember, 'id' | 'joinedAt'>>): Promise<ProjectMember | undefined> {
  const cached = _cache.get(id);
  const projectId = data.projectId ?? cached?.projectId;
  if (!projectId) return undefined;

  const member = await api.put<ProjectMember>(`/projects/${projectId}/members/${id}`, data).catch(() => undefined);
  if (member) _cache.set(member.id, member);
  return member;
}

export async function remove(id: string): Promise<void> {
  const cached = _cache.get(id);
  if (!cached) return;
  await api.delete(`/projects/${cached.projectId}/members/${id}`);
  _cache.delete(id);
}
