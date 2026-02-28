import { describe, it, expect } from 'vitest';
import {
  validate,
  ProjectCreateSchema,
  CatalogItemCreateSchema,
  UserGearItemCreateSchema,
  RegisterSchema,
} from '../schemas';
import { CatalogCategory, CrewType, GearCondition } from '@/types/enums';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const validProject = {
  userId: 'user-1',
  name: 'My Film',
  crewType: CrewType.Camera,
  role: '1st AC',
  productionCompany: 'Acme Productions',
  firstAC: 'Jane Doe',
  notes: '',
  startDate: '2025-01-01',
  endDate: '2025-01-10',
  trialStartDate: null,
  trialEndDate: null,
};

const validCatalogItem = {
  name: 'ARRI Alexa 35',
  brand: 'ARRI',
  category: CatalogCategory.Camera,
  description: 'Cinema camera',
  aliases: ['Alexa35'],
  compatibilityNotes: '',
  imageUrl: null,
};

const validUserGear = {
  userId: 'user-1',
  catalogItemId: 'cat-1',
  quantity: 2,
  condition: GearCondition.Good,
  serialNumber: 'SN-123',
  notes: '',
  purchaseDate: null,
};

const validRegister = {
  email: 'user@example.com',
  password: 'secret123',
};

// ─── validate() helper ────────────────────────────────────────────────────────

describe('validate()', () => {
  it('returns parsed data on success', () => {
    const result = validate(RegisterSchema, validRegister);
    expect(result).toEqual(validRegister);
  });

  it('throws with the first issue message on failure', () => {
    expect(() => validate(RegisterSchema, { email: 'bad', password: 'abc' })).toThrow(
      'Invalid email address',
    );
  });
});

// ─── ProjectCreateSchema ──────────────────────────────────────────────────────

describe('ProjectCreateSchema', () => {
  it('accepts a valid project', () => {
    const result = ProjectCreateSchema.safeParse(validProject);
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = ProjectCreateSchema.safeParse({ ...validProject, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Project name is required');
    }
  });

  it('rejects a missing name', () => {
    const { name: _n, ...rest } = validProject;
    const result = ProjectCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('accepts with null dates', () => {
    const result = ProjectCreateSchema.safeParse({
      ...validProject,
      startDate: null,
      endDate: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects if endDate is before startDate', () => {
    const result = ProjectCreateSchema.safeParse({
      ...validProject,
      startDate: '2025-06-10',
      endDate: '2025-06-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('End date must be on or after start date');
    }
  });

  it('accepts if endDate equals startDate', () => {
    const result = ProjectCreateSchema.safeParse({
      ...validProject,
      startDate: '2025-06-01',
      endDate: '2025-06-01',
    });
    expect(result.success).toBe(true);
  });

  it('accepts if only startDate is set', () => {
    const result = ProjectCreateSchema.safeParse({
      ...validProject,
      startDate: '2025-06-01',
      endDate: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects a name exceeding 100 characters', () => {
    const result = ProjectCreateSchema.safeParse({
      ...validProject,
      name: 'A'.repeat(101),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Project name must be 100 characters or less',
      );
    }
  });
});

// ─── CatalogItemCreateSchema ──────────────────────────────────────────────────

describe('CatalogItemCreateSchema', () => {
  it('accepts a valid catalog item', () => {
    const result = CatalogItemCreateSchema.safeParse(validCatalogItem);
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = CatalogItemCreateSchema.safeParse({ ...validCatalogItem, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Name is required');
    }
  });

  it('rejects an empty brand', () => {
    const result = CatalogItemCreateSchema.safeParse({ ...validCatalogItem, brand: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Brand is required');
    }
  });

  it('rejects an invalid category', () => {
    const result = CatalogItemCreateSchema.safeParse({
      ...validCatalogItem,
      category: 'InvalidCat',
    });
    expect(result.success).toBe(false);
  });

  it('accepts without optional fields', () => {
    const result = CatalogItemCreateSchema.safeParse(validCatalogItem);
    expect(result.success).toBe(true);
  });

  it('accepts with optional fields present', () => {
    const result = CatalogItemCreateSchema.safeParse({
      ...validCatalogItem,
      subcategory: 'Digital Cinema',
      mount: 'LPL',
      weightKg: 3.5,
      connectors: ['12V'],
      specs: { sensor: 'S35' },
      source: 'admin',
    });
    expect(result.success).toBe(true);
  });
});

// ─── UserGearItemCreateSchema ─────────────────────────────────────────────────

describe('UserGearItemCreateSchema', () => {
  it('accepts a valid user gear item', () => {
    const result = UserGearItemCreateSchema.safeParse(validUserGear);
    expect(result.success).toBe(true);
  });

  it('rejects quantity less than 1', () => {
    const result = UserGearItemCreateSchema.safeParse({ ...validUserGear, quantity: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Quantity must be at least 1');
    }
  });

  it('rejects a non-integer quantity', () => {
    const result = UserGearItemCreateSchema.safeParse({ ...validUserGear, quantity: 1.5 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Quantity must be a whole number');
    }
  });

  it('rejects an empty catalogItemId', () => {
    const result = UserGearItemCreateSchema.safeParse({ ...validUserGear, catalogItemId: '' });
    expect(result.success).toBe(false);
  });
});

// ─── RegisterSchema ───────────────────────────────────────────────────────────

describe('RegisterSchema', () => {
  it('accepts a valid email and password', () => {
    const result = RegisterSchema.safeParse(validRegister);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = RegisterSchema.safeParse({ ...validRegister, email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid email address');
    }
  });

  it('rejects a password shorter than 6 characters', () => {
    const result = RegisterSchema.safeParse({ ...validRegister, password: 'abc' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password must be at least 6 characters');
    }
  });

  it('accepts a password of exactly 6 characters', () => {
    const result = RegisterSchema.safeParse({ ...validRegister, password: 'abc123' });
    expect(result.success).toBe(true);
  });
});
