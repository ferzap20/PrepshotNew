import { api } from './client';
import type { User } from '@/types/models';

export async function getAll(): Promise<User[]> {
  return api.get<User[]>('/users');
}

export async function getById(id: string): Promise<User | undefined> {
  return api.get<User>(`/users/${id}`).catch(() => undefined);
}

export async function getByEmail(_email: string): Promise<User | undefined> {
  return undefined;
}

export async function lookupByEmail(email: string): Promise<Pick<User, 'id' | 'email' | 'name' | 'createdAt'> | null> {
  return api.get<Pick<User, 'id' | 'email' | 'name' | 'createdAt'>>(`/users/lookup?email=${encodeURIComponent(email)}`).catch(() => null);
}

export async function create(_data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  throw new Error('Use /api/auth/register to create users');
}

export async function update(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | undefined> {
  return api.put<User>(`/users/${id}`, data).catch(() => undefined);
}

export async function remove(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}
