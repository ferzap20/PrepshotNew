import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from './connection.js';
import * as schema from './schema.js';
import { generateId, nowISO } from '../lib/utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Path to the frontend gear JSON files (single source of truth)
const gearDir = join(__dirname, '../../../src/data/gear');

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

function loadGearFile(filename: string): GearJsonItem[] {
  try {
    return JSON.parse(readFileSync(join(gearDir, filename), 'utf-8')) as GearJsonItem[];
  } catch {
    console.warn(`Warning: could not load ${filename}, skipping.`);
    return [];
  }
}

async function seedAdminUser(): Promise<void> {
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, 'admin@prepshot.local'))
    .limit(1);

  if (existing.length > 0) {
    console.log('Admin user already exists, skipping.');
    return;
  }

  const passwordHash = await bcrypt.hash('admin', 10);
  const now = nowISO();

  await db.insert(schema.users).values({
    id: generateId(),
    email: 'admin@prepshot.local',
    passwordHash,
    role: 'admin',
    name: 'Admin',
    createdAt: now,
    updatedAt: now,
  });

  console.log('Admin user created: admin@prepshot.local / admin');
}

async function seedCatalog(): Promise<void> {
  const gearFiles = [
    'cameras.json',
    'lens.json',
    'cables.json',
    'grip.json',
    'lights.json',
    'accessories.json',
    'audio.json',
  ];

  const allItems: GearJsonItem[] = gearFiles.flatMap(loadGearFile);
  const now = nowISO();
  let created = 0;
  let skipped = 0;

  for (const raw of allItems) {
    const existing = await db
      .select({ id: schema.catalogItems.id })
      .from(schema.catalogItems)
      .where(eq(schema.catalogItems.id, raw.id))
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    await db.insert(schema.catalogItems).values({
      id: raw.id,
      name: raw.name,
      brand: raw.brand ?? '',
      category: raw.category,
      description: raw.description ?? '',
      aliases: [],
      compatibilityNotes: raw.compatibility?.join(', ') ?? '',
      imageUrl: null,
      subcategory: raw.subcategory,
      mount: raw.mount,
      specs: raw.specs,
      weightKg: raw.weight_kg,
      connectors: raw.connectors,
      source: raw.source,
      createdAt: now,
      updatedAt: now,
    });

    created++;
  }

  console.log(`Catalog: ${created} items created, ${skipped} skipped.`);
}

async function main() {
  console.log('Seeding database…');
  await seedAdminUser();
  await seedCatalog();
  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
