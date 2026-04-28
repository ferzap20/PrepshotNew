import { api } from './client';
import type { CatalogRentalSource } from '@/types/models';

// Not actively used in any page — stubs preserve the interface
export async function getAll(): Promise<CatalogRentalSource[]> {
  return [];
}

export async function getByCatalogItemId(_catalogItemId: string): Promise<CatalogRentalSource[]> {
  return [];
}

export async function getByRentalSourceId(rentalSourceId: string): Promise<CatalogRentalSource[]> {
  return api.get<CatalogRentalSource[]>(`/rental-sources/${rentalSourceId}/catalog`);
}

export async function create(data: CatalogRentalSource): Promise<CatalogRentalSource> {
  await api.post(`/rental-sources/${data.rentalSourceId}/catalog/${data.catalogItemId}`);
  return data;
}

export async function remove(catalogItemId: string, rentalSourceId: string): Promise<void> {
  await api.delete(`/rental-sources/${rentalSourceId}/catalog/${catalogItemId}`);
}
