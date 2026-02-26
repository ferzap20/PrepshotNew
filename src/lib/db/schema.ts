import type { DBSchema } from 'idb';
import type {
  User,
  Project,
  ProjectMember,
  ShootingDay,
  DailyDocument,
  CatalogItem,
  RentalSource,
  CatalogRentalSource,
  ProjectGeneralListItem,
  DayListModification,
  PackageTemplate,
  TemplateItem,
  UserGearItem,
  AppSetting,
} from '@/types/models';

export interface PrepShotDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { 'by-email': string };
  };
  projects: {
    key: string;
    value: Project;
    indexes: { 'by-userId': string };
  };
  shooting_days: {
    key: string;
    value: ShootingDay;
    indexes: { 'by-projectId': string; 'by-date': string };
  };
  daily_documents: {
    key: string;
    value: DailyDocument;
    indexes: { 'by-dayId': string };
  };
  catalog_items: {
    key: string;
    value: CatalogItem;
    indexes: { 'by-category': string; 'by-brand': string };
  };
  rental_sources: {
    key: string;
    value: RentalSource;
  };
  catalog_rental_sources: {
    key: [string, string];
    value: CatalogRentalSource;
    indexes: { 'by-catalogItemId': string; 'by-rentalSourceId': string };
  };
  project_members: {
    key: string;
    value: ProjectMember;
    indexes: { 'by-projectId': string; 'by-userId': string };
  };
  project_general_lists: {
    key: string;
    value: ProjectGeneralListItem;
    indexes: { 'by-projectId': string; 'by-catalogItemId': string; 'by-userId': string };
  };
  day_list_modifications: {
    key: string;
    value: DayListModification;
    indexes: { 'by-dayId': string; 'by-catalogItemId': string };
  };
  package_templates: {
    key: string;
    value: PackageTemplate;
    indexes: { 'by-userId': string };
  };
  template_items: {
    key: string;
    value: TemplateItem;
    indexes: { 'by-templateId': string };
  };
  user_gear: {
    key: string;
    value: UserGearItem;
    indexes: { 'by-userId': string; 'by-catalogItemId': string };
  };
  app_settings: {
    key: string;
    value: AppSetting;
  };
}

export const DB_NAME = 'prepshot-db';
export const DB_VERSION = 3;
