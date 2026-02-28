import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openTestDB } from '@/test/open-test-db';

vi.mock('@/lib/db/connection', () => ({
  getDB: vi.fn(),
}));

import { getDB } from '@/lib/db/connection';
import * as projectsRepo from '../projects';
import { CrewType } from '@/types/enums';

const baseProject = {
  userId: 'user-1',
  name: 'Test Project',
  crewType: CrewType.Camera,
  startDate: '2026-03-01',
  endDate: '2026-03-10',
  trialStartDate: null,
  trialEndDate: null,
  role: '1st AC',
  productionCompany: 'Studio Inc.',
  firstAC: 'John Doe',
  notes: 'Some notes',
};

beforeEach(async () => {
  const testDB = await openTestDB();
  vi.mocked(getDB).mockResolvedValue(testDB as never);
});

describe('getAll', () => {
  it('returns an empty array when no projects exist', async () => {
    const projects = await projectsRepo.getAll();
    expect(projects).toEqual([]);
  });
});

describe('create', () => {
  it('generates an id and timestamps', async () => {
    const project = await projectsRepo.create(baseProject);
    expect(project.id).toBeTruthy();
    expect(project.createdAt).toBeTruthy();
    expect(project.updatedAt).toBeTruthy();
    expect(project.name).toBe('Test Project');
  });
});

describe('getById', () => {
  it('returns the project that was created', async () => {
    const created = await projectsRepo.create(baseProject);
    const found = await projectsRepo.getById(created.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
  });

  it('returns undefined for an unknown id', async () => {
    const found = await projectsRepo.getById('does-not-exist');
    expect(found).toBeUndefined();
  });
});

describe('getByUserId', () => {
  it('returns only projects belonging to the given user', async () => {
    await projectsRepo.create({ ...baseProject, userId: 'user-A' });
    await projectsRepo.create({ ...baseProject, userId: 'user-B' });

    const userAProjects = await projectsRepo.getByUserId('user-A');
    expect(userAProjects).toHaveLength(1);
    expect(userAProjects[0].userId).toBe('user-A');
  });
});

describe('update', () => {
  it('updates fields and refreshes updatedAt', async () => {
    const created = await projectsRepo.create(baseProject);
    const before = created.updatedAt;

    await new Promise((r) => setTimeout(r, 5));
    const updated = await projectsRepo.update(created.id, { name: 'Renamed' });

    expect(updated).toBeDefined();
    expect(updated!.name).toBe('Renamed');
    expect(updated!.updatedAt).not.toBe(before);
  });

  it('returns undefined for an unknown id', async () => {
    const result = await projectsRepo.update('ghost-id', { name: 'Ghost' });
    expect(result).toBeUndefined();
  });
});

describe('remove', () => {
  it('deletes the project', async () => {
    const created = await projectsRepo.create(baseProject);
    await projectsRepo.remove(created.id);
    const found = await projectsRepo.getById(created.id);
    expect(found).toBeUndefined();
  });
});

describe('duplicate', () => {
  it('creates a copy with a new id', async () => {
    const original = await projectsRepo.create(baseProject);
    const copy = await projectsRepo.duplicate(original.id, 'user-2');

    expect(copy).toBeDefined();
    expect(copy!.id).not.toBe(original.id);
    expect(copy!.name).toBe(original.name);
    expect(copy!.userId).toBe('user-2');
  });

  it('returns undefined for an unknown id', async () => {
    const result = await projectsRepo.duplicate('ghost', 'user-1');
    expect(result).toBeUndefined();
  });
});
