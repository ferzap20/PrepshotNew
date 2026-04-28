import type { RentalCompany, RentalSource } from '@/types/models';

export function localSourceToCompany(s: RentalSource): RentalCompany {
  return {
    id: s.id,
    name: s.name,
    city: s.location || '',
    country: '',
    address: s.address || '',
    phone: '',
    email: '',
    website: '',
    specialties: [],
    featured: false,
    notes: s.notes || '',
  };
}
