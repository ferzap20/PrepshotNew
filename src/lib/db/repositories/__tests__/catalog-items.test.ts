import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openTestDB } from '@/test/open-test-db';

vi.mock('@/lib/db/connection', () => ({
  getDB: vi.fn(),
}));

import { getDB } from '@/lib/db/connection';
import * as catalogRepo from '../catalog-items';
import { CatalogCategory } from '@/types/enums';

const baseItem = {
  name: 'ARRI ALEXA 35',
  brand: 'ARRI',
  category: CatalogCategory.Camera,
  description: 'Professional cinema camera',
  aliases: ['ALEXA35', 'A35'],
  compatibilityNotes: 'LPL and PL mounts',
  imageUrl: null,
};

beforeEach(async () => {
  const testDB = await openTestDB();
  vi.mocked(getDB).mockResolvedValue(testDB as never);
});

describe('getAll', () => {
  it('returns an empty array initially', async () => {
    const items = await catalogRepo.getAll();
    expect(items).toEqual([]);
  });
});

describe('create', () => {
  it('generates an id and timestamps', async () => {
    const item = await catalogRepo.create(baseItem);
    expect(item.id).toBeTruthy();
    expect(item.createdAt).toBeTruthy();
    expect(item.updatedAt).toBeTruthy();
    expect(item.name).toBe('ARRI ALEXA 35');
  });

  it('returns all items via getAll after creation', async () => {
    await catalogRepo.create(baseItem);
    await catalogRepo.create({ ...baseItem, name: 'VENICE 2' });
    const all = await catalogRepo.getAll();
    expect(all).toHaveLength(2);
  });
});

describe('getById', () => {
  it('returns the correct item', async () => {
    const created = await catalogRepo.create(baseItem);
    const found = await catalogRepo.getById(created.id);
    expect(found).toBeDefined();
    expect(found!.name).toBe('ARRI ALEXA 35');
  });

  it('returns undefined for an unknown id', async () => {
    const found = await catalogRepo.getById('unknown');
    expect(found).toBeUndefined();
  });
});

describe('getByCategory', () => {
  it('filters items by category', async () => {
    await catalogRepo.create(baseItem);
    await catalogRepo.create({ ...baseItem, name: 'ARRI SkyPanel', category: CatalogCategory.Lighting });

    const cameras = await catalogRepo.getByCategory(CatalogCategory.Camera);
    expect(cameras).toHaveLength(1);
    expect(cameras[0].category).toBe(CatalogCategory.Camera);
  });
});

describe('update', () => {
  it('updates the item and refreshes updatedAt', async () => {
    const created = await catalogRepo.create(baseItem);
    const before = created.updatedAt;

    await new Promise((r) => setTimeout(r, 5));
    const updated = await catalogRepo.update(created.id, { name: 'ALEXA 35 LF' });

    expect(updated).toBeDefined();
    expect(updated!.name).toBe('ALEXA 35 LF');
    expect(updated!.updatedAt).not.toBe(before);
  });

  it('returns undefined for an unknown id', async () => {
    const result = await catalogRepo.update('ghost', { name: 'Ghost' });
    expect(result).toBeUndefined();
  });
});

describe('remove', () => {
  it('deletes the item', async () => {
    const created = await catalogRepo.create(baseItem);
    await catalogRepo.remove(created.id);
    const found = await catalogRepo.getById(created.id);
    expect(found).toBeUndefined();
  });
});
