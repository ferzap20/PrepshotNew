import { getDB } from '../connection';
import type { CatalogRentalSource } from '@/types/models';

export async function getAll(): Promise<CatalogRentalSource[]> {
  const db = await getDB();
  return db.getAll('catalog_rental_sources');
}

export async function getByCatalogItemId(catalogItemId: string): Promise<CatalogRentalSource[]> {
  const db = await getDB();
  return db.getAllFromIndex('catalog_rental_sources', 'by-catalogItemId', catalogItemId);
}

export async function getByRentalSourceId(rentalSourceId: string): Promise<CatalogRentalSource[]> {
  const db = await getDB();
  return db.getAllFromIndex('catalog_rental_sources', 'by-rentalSourceId', rentalSourceId);
}

export async function create(data: CatalogRentalSource): Promise<CatalogRentalSource> {
  const db = await getDB();
  await db.put('catalog_rental_sources', data);
  return data;
}

export async function remove(catalogItemId: string, rentalSourceId: string): Promise<void> {
  const db = await getDB();
  await db.delete('catalog_rental_sources', [catalogItemId, rentalSourceId]);
}
