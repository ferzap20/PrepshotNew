import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openTestDB } from '@/test/open-test-db';
import type { IDBPDatabase } from 'idb';
import type { PrepShotDB } from '@/lib/db/schema';

vi.mock('@/lib/db/connection', () => ({
  getDB: vi.fn(),
}));

// Provide a minimal in-memory appSettingsRepo backed by a Map
const settingsStore = new Map<string, string>();

vi.mock('@/lib/db/repositories', () => ({
  appSettingsRepo: {
    get: vi.fn(async (key: string) =>
      settingsStore.has(key) ? { key, value: settingsStore.get(key)!, updatedAt: '' } : undefined,
    ),
    set: vi.fn(async (key: string, value: string) => {
      settingsStore.set(key, value);
      return { key, value, updatedAt: '' };
    }),
  },
}));

import { getDB } from '@/lib/db/connection';
import { seedAdminUser, seedDefaultSettings, seedCatalog } from '../seed';

let testDB: IDBPDatabase<PrepShotDB>;

beforeEach(async () => {
  settingsStore.clear();
  testDB = await openTestDB();
  vi.mocked(getDB).mockResolvedValue(testDB as never);
});

describe('seedAdminUser', () => {
  it('creates the admin user on an empty database', async () => {
    await seedAdminUser();
    const admin = await testDB.getFromIndex('users', 'by-email', 'admin@prepshot.local');
    expect(admin).toBeDefined();
    expect(admin!.role).toBe('admin');
  });

  it('is idempotent — running twice does not throw or duplicate', async () => {
    await seedAdminUser();
    await expect(seedAdminUser()).resolves.toBeUndefined();

    const all = await testDB.getAll('users');
    expect(all).toHaveLength(1);
  });
});

describe('seedDefaultSettings', () => {
  it('creates default settings when none exist', async () => {
    await seedDefaultSettings();
    expect(settingsStore.get('personal_item_label')).toBe('personal item');
    expect(settingsStore.get('date_format')).toBe('DD/MM/YYYY');
  });

  it('does not overwrite existing settings', async () => {
    settingsStore.set('personal_item_label', 'custom label');
    settingsStore.set('date_format', 'MM/DD/YYYY');

    await seedDefaultSettings();

    expect(settingsStore.get('personal_item_label')).toBe('custom label');
    expect(settingsStore.get('date_format')).toBe('MM/DD/YYYY');
  });
});

describe('seedCatalog', () => {
  it('inserts catalog items on first run', async () => {
    await seedCatalog();
    const items = await testDB.getAll('catalog_items');
    expect(items.length).toBeGreaterThan(0);
  });

  it('sets the catalog_seed_version after seeding', async () => {
    await seedCatalog();
    expect(settingsStore.get('catalog_seed_version')).toBe('1');
  });

  it('is idempotent — skips seeding when version matches', async () => {
    settingsStore.set('catalog_seed_version', '1');
    await seedCatalog();
    // No items inserted because version already matches
    const items = await testDB.getAll('catalog_items');
    expect(items).toHaveLength(0);
  });
});
