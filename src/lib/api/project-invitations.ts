import { api } from './client';
import type { ProjectInvitation } from '@/types/models';

export async function getByProjectId(projectId: string): Promise<ProjectInvitation[]> {
  return api.get<ProjectInvitation[]>(`/projects/${projectId}/invitations`);
}

export async function create(projectId: string, email: string): Promise<ProjectInvitation> {
  return api.post<ProjectInvitation>(`/projects/${projectId}/invitations`, { email });
}

export async function remove(projectId: string, invitationId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/invitations/${invitationId}`);
}
