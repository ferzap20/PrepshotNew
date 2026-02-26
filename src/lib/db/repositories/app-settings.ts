import { getDB } from '../connection';
import type { AppSetting } from '@/types/models';
import { nowISO } from '@/lib/utils/date';

export async function get(key: string): Promise<AppSetting | undefined> {
  const db = await getDB();
  return db.get('app_settings', key);
}

export async function set(key: string, value: string): Promise<AppSetting> {
  const db = await getDB();
  const setting: AppSetting = { key, value, updatedAt: nowISO() };
  await db.put('app_settings', setting);
  return setting;
}

export async function getAll(): Promise<AppSetting[]> {
  const db = await getDB();
  return db.getAll('app_settings');
}

export async function remove(key: string): Promise<void> {
  const db = await getDB();
  await db.delete('app_settings', key);
}
