import type { UserRole, ModificationType, FileType, CatalogCategory, ProjectRole, CrewType, GearCondition } from './enums';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  crewType: CrewType | string;
  startDate: string | null;
  endDate: string | null;
  trialStartDate: string | null;
  trialEndDate: string | null;
  role: ProjectRole | string;
  productionCompany: string;
  firstAC: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  crewType: CrewType | string;
  role: string;
  isOwner: boolean;
  joinedAt: string;
  updatedAt: string;
}

export interface ShootingDay {
  id: string;
  projectId: string;
  date: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyDocument {
  id: string;
  dayId: string;
  filePath: string;
  fileName: string;
  fileType: FileType;
  createdAt: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: CatalogCategory;
  brand: string;
  description: string;
  aliases: string[];
  compatibilityNotes: string;
  imageUrl: string | null;
  subcategory?: string;
  mount?: string;
  specs?: Record<string, unknown>;
  weightKg?: number;
  connectors?: string[];
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RentalSource {
  id: string;
  name: string;
  location: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  contactInfo: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogRentalSource {
  catalogItemId: string;
  rentalSourceId: string;
}

export interface ProjectGeneralListItem {
  id: string;
  projectId: string;
  userId: string;
  catalogItemId: string;
  quantity: number;
  notes: string;
  isRequired: boolean;
  published: boolean;
  source?: 'personal' | 'rental' | null;
  userGearId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DayListModification {
  id: string;
  dayId: string;
  catalogItemId: string;
  modificationType: ModificationType;
  quantity: number;
  notes: string;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PackageTemplate {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateItem {
  id: string;
  templateId: string;
  catalogItemId: string;
  quantity: number;
  notes: string;
  isRequired: boolean;
}

export interface UserGearItem {
  id: string;
  userId: string;
  catalogItemId: string;
  serialNumber: string;
  condition: GearCondition;
  purchaseDate: string | null;
  notes: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppSetting {
  key: string;
  value: string;
  updatedAt: string;
}

export interface RentalCompany {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  specialties: string[];
  featured: boolean;
  notes: string;
}
