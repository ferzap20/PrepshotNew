import { pgTable, text, integer, boolean, real, jsonb, primaryKey } from 'drizzle-orm/pg-core';

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('user'), // 'admin' | 'user'
  name: text('name'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  crewType: text('crew_type').notNull().default(''),
  startDate: text('start_date'),
  endDate: text('end_date'),
  trialStartDate: text('trial_start_date'),
  trialEndDate: text('trial_end_date'),
  role: text('role').notNull().default(''),
  productionCompany: text('production_company').notNull().default(''),
  firstAC: text('first_ac').notNull().default(''),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ---------------------------------------------------------------------------
// Project Members
// ---------------------------------------------------------------------------
export const projectMembers = pgTable('project_members', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  crewType: text('crew_type').notNull().default(''),
  role: text('role').notNull().default(''),
  isOwner: boolean('is_owner').notNull().default(false),
  joinedAt: text('joined_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ---------------------------------------------------------------------------
// Project Invitations
// ---------------------------------------------------------------------------
export const projectInvitations = pgTable('project_invitations', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  invitedBy: text('invited_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull(),
});

// ---------------------------------------------------------------------------
// List Item Comments
// ---------------------------------------------------------------------------
export const listItemComments = pgTable('list_item_comments', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  listItemId: text('list_item_id')
    .notNull()
    .references(() => projectGeneralLists.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  createdAt: text('created_at').notNull(),
});

// ---------------------------------------------------------------------------
// Shooting Days
// ---------------------------------------------------------------------------
export const shootingDays = pgTable('shooting_days', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ---------------------------------------------------------------------------
// Daily Documents
// ---------------------------------------------------------------------------
export const dailyDocuments = pgTable('daily_documents', {
  id: text('id').primaryKey(),
  dayId: text('day_id')
    .notNull()
    .references(() => shootingDays.id, { onDelete: 'cascade' }),
  filePath: text('file_path').notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(), // 'pdf' | 'image'
  createdAt: text('created_at').notNull(),
});

// ---------------------------------------------------------------------------
// Catalog Items
// ---------------------------------------------------------------------------
export const catalogItems = pgTable('catalog_items', {
  id: text('id').primaryKey(), // string slug ID (e.g. "camera_arri_alexa35"), not UUID
  name: text('name').notNull(),
  category: text('category').notNull(),
  brand: text('brand').notNull().default(''),
  description: text('description').notNull().default(''),
  aliases: jsonb('aliases').$type<string[]>().notNull().default([]),
  compatibilityNotes: text('compatibility_notes').notNull().default(''),
  imageUrl: text('image_url'),
  subcategory: text('subcategory'),
  mount: text('mount'),
  specs: jsonb('specs').$type<Record<string, unknown>>(),
  weightKg: real('weight_kg'),
  connectors: jsonb('connectors').$type<string[]>(),
  source: text('source'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ---------------------------------------------------------------------------
// Rental Sources
// ---------------------------------------------------------------------------
export const rentalSources = pgTable('rental_sources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull().default(''),
  address: text('address').notNull().default(''),
  latitude: real('latitude'),
  longitude: real('longitude'),
  contactInfo: text('contact_info').notNull().default(''),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ---------------------------------------------------------------------------
// Catalog <-> Rental Source junction
// ---------------------------------------------------------------------------
export const catalogRentalSources = pgTable(
  'catalog_rental_sources',
  {
    catalogItemId: text('catalog_item_id')
      .notNull()
      .references(() => catalogItems.id, { onDelete: 'cascade' }),
    rentalSourceId: text('rental_source_id')
      .notNull()
      .references(() => rentalSources.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.catalogItemId, table.rentalSourceId] })],
);

// ---------------------------------------------------------------------------
// Project General List Items
// ---------------------------------------------------------------------------
export const projectGeneralLists = pgTable('project_general_lists', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  catalogItemId: text('catalog_item_id')
    .notNull()
    .references(() => catalogItems.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  notes: text('notes').notNull().default(''),
  isRequired: boolean('is_required').notNull().default(false),
  published: boolean('published').notNull().default(false),
  source: text('source'), // 'personal' | 'rental' | null
  userGearId: text('user_gear_id'), // FK to user_gear (nullable, set when source='personal')
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ---------------------------------------------------------------------------
// Day List Modifications
// ---------------------------------------------------------------------------
export const dayListModifications = pgTable('day_list_modifications', {
  id: text('id').primaryKey(),
  dayId: text('day_id')
    .notNull()
    .references(() => shootingDays.id, { onDelete: 'cascade' }),
  catalogItemId: text('catalog_item_id')
    .notNull()
    .references(() => catalogItems.id, { onDelete: 'cascade' }),
  modificationType: text('modification_type').notNull(), // 'add' | 'remove' | 'modify'
  quantity: integer('quantity').notNull().default(1),
  notes: text('notes').notNull().default(''),
  isRequired: boolean('is_required').notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ---------------------------------------------------------------------------
// Package Templates
// ---------------------------------------------------------------------------
export const packageTemplates = pgTable('package_templates', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ---------------------------------------------------------------------------
// Template Items
// ---------------------------------------------------------------------------
export const templateItems = pgTable('template_items', {
  id: text('id').primaryKey(),
  templateId: text('template_id')
    .notNull()
    .references(() => packageTemplates.id, { onDelete: 'cascade' }),
  catalogItemId: text('catalog_item_id')
    .notNull()
    .references(() => catalogItems.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  notes: text('notes').notNull().default(''),
  isRequired: boolean('is_required').notNull().default(false),
});

// ---------------------------------------------------------------------------
// User Gear (personal inventory)
// ---------------------------------------------------------------------------
export const userGear = pgTable('user_gear', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  catalogItemId: text('catalog_item_id')
    .notNull()
    .references(() => catalogItems.id, { onDelete: 'cascade' }),
  serialNumber: text('serial_number').notNull().default(''),
  condition: text('condition').notNull().default('Good'), // GearCondition enum values
  purchaseDate: text('purchase_date'),
  notes: text('notes').notNull().default(''),
  quantity: integer('quantity').notNull().default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'added_to_project' | 'removed_from_project' | 'new_comment'
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  read: boolean('read').notNull().default(false),
  createdAt: text('created_at').notNull(),
});

// ---------------------------------------------------------------------------
// App Settings (per-user key/value store)
// ---------------------------------------------------------------------------
export const appSettings = pgTable(
  'app_settings',
  {
    key: text('key').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    value: text('value').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [primaryKey({ columns: [table.key, table.userId] })],
);
