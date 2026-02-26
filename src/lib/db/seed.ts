import { getDB } from './connection';
import { appSettingsRepo } from './repositories';
import type { User } from '@/types/models';
import { UserRole } from '@/types/enums';
import { generateId } from '@/lib/utils/id';
import { nowISO } from '@/lib/utils/date';

// Pre-computed bcrypt hash — plaintext never appears in the bundle
const ADMIN_HASH = '$2b$10$tOQm2PrR43YmfvUMULZtjOkXjJeNr7CLd4WKdZ/3m0E3GSxxq3J1e';

export async function seedAdminUser(): Promise<void> {
  const db = await getDB();
  const existing = await db.getFromIndex('users', 'by-email', 'admin@prepshot.local');
  if (existing) return;

  const now = nowISO();
  const admin: User = {
    id: generateId(),
    email: 'admin@prepshot.local',
    passwordHash: ADMIN_HASH,
    role: UserRole.Admin,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('users', admin);
}

export async function seedDefaultSettings(): Promise<void> {
  if (!await appSettingsRepo.get('personal_item_label')) {
    await appSettingsRepo.set('personal_item_label', 'personal item');
  }
  if (!await appSettingsRepo.get('date_format')) {
    await appSettingsRepo.set('date_format', 'DD/MM/YYYY');
  }
}

export async function seed(): Promise<void> {
  await seedAdminUser();
  await seedDefaultSettings();
}
