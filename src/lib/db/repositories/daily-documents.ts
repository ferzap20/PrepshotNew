import { getDB } from '../connection';
import type { DailyDocument } from '@/types/models';
import { generateId } from '@/lib/utils/id';
import { nowISO } from '@/lib/utils/date';

export async function getAll(): Promise<DailyDocument[]> {
  const db = await getDB();
  return db.getAll('daily_documents');
}

export async function getById(id: string): Promise<DailyDocument | undefined> {
  const db = await getDB();
  return db.get('daily_documents', id);
}

export async function getByDayId(dayId: string): Promise<DailyDocument[]> {
  const db = await getDB();
  return db.getAllFromIndex('daily_documents', 'by-dayId', dayId);
}

export async function create(data: Omit<DailyDocument, 'id' | 'createdAt'>): Promise<DailyDocument> {
  const db = await getDB();
  const doc: DailyDocument = { ...data, id: generateId(), createdAt: nowISO() };
  await db.put('daily_documents', doc);
  return doc;
}

export async function remove(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('daily_documents', id);
}
