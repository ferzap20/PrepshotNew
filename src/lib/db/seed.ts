import { getDB } from './connection';
import { appSettingsRepo } from './repositories';
import type { User, CatalogItem } from '@/types/models';
import type { CatalogCategory } from '@/types/enums';
import { UserRole } from '@/types/enums';
import { generateId } from '@/lib/utils/id';
import { nowISO } from '@/lib/utils/date';

import camerasData from '@/data/gear/cameras.json';
import lensData from '@/data/gear/lens.json';
import cablesData from '@/data/gear/cables.json';
import gripData from '@/data/gear/grip.json';
import lightsData from '@/data/gear/lights.json';
import accessoriesData from '@/data/gear/accessories.json';
import audioData from '@/data/gear/audio.json';

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

interface GearJsonItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  description?: string;
  mount?: string;
  specs?: Record<string, unknown>;
  weight_kg?: number;
  connectors?: string[];
  compatibility?: string[];
  source?: string;
}

const CATALOG_SEED_VERSION = '2';

function mapGearItem(raw: GearJsonItem): CatalogItem {
  const now = nowISO();
  return {
    id: raw.id,
    name: raw.name,
    brand: raw.brand,
    category: raw.category as CatalogCategory,
    description: raw.description ?? '',
    aliases: [],
    compatibilityNotes: raw.compatibility?.length ? raw.compatibility.join(', ') : '',
    imageUrl: null,
    subcategory: raw.subcategory,
    mount: raw.mount,
    specs: raw.specs,
    weightKg: raw.weight_kg,
    connectors: raw.connectors,
    source: raw.source,
    createdAt: now,
    updatedAt: now,
  };
}

export async function seedCatalog(): Promise<void> {
  const currentVersion = await appSettingsRepo.get('catalog_seed_version');
  if (currentVersion?.value === CATALOG_SEED_VERSION) return;

  const db = await getDB();
  const allRaw: GearJsonItem[] = [
    ...camerasData,
    ...lensData,
    ...cablesData,
    ...gripData,
    ...lightsData,
    ...accessoriesData,
    ...audioData,
  ];

  for (const raw of allRaw) {
    const existing = await db.get('catalog_items', raw.id);
    if (!existing) {
      await db.put('catalog_items', mapGearItem(raw));
    }
  }

  await appSettingsRepo.set('catalog_seed_version', CATALOG_SEED_VERSION);
}

export async function seed(): Promise<void> {
  await seedAdminUser();
  await seedDefaultSettings();
  await seedCatalog();
}
