import { openDB, type IDBPDatabase } from 'idb';
import type { PrepShotDB } from './schema';
import { DB_NAME, DB_VERSION } from './schema';

let dbInstance: IDBPDatabase<PrepShotDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<PrepShotDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<PrepShotDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, _newVersion, transaction) {
      // ---- Version 1: Initial schema ----
      if (oldVersion < 1) {
        const usersStore = db.createObjectStore('users', { keyPath: 'id' });
        usersStore.createIndex('by-email', 'email', { unique: true });

        const projectsStore = db.createObjectStore('projects', { keyPath: 'id' });
        projectsStore.createIndex('by-userId', 'userId');

        const daysStore = db.createObjectStore('shooting_days', { keyPath: 'id' });
        daysStore.createIndex('by-projectId', 'projectId');
        daysStore.createIndex('by-date', 'date');

        const docsStore = db.createObjectStore('daily_documents', { keyPath: 'id' });
        docsStore.createIndex('by-dayId', 'dayId');

        const catalogStore = db.createObjectStore('catalog_items', { keyPath: 'id' });
        catalogStore.createIndex('by-category', 'category');
        catalogStore.createIndex('by-brand', 'brand');

        db.createObjectStore('rental_sources', { keyPath: 'id' });

        const crsStore = db.createObjectStore('catalog_rental_sources', {
          keyPath: ['catalogItemId', 'rentalSourceId'],
        });
        crsStore.createIndex('by-catalogItemId', 'catalogItemId');
        crsStore.createIndex('by-rentalSourceId', 'rentalSourceId');

        const pglStore = db.createObjectStore('project_general_lists', { keyPath: 'id' });
        pglStore.createIndex('by-projectId', 'projectId');
        pglStore.createIndex('by-catalogItemId', 'catalogItemId');

        const dlmStore = db.createObjectStore('day_list_modifications', { keyPath: 'id' });
        dlmStore.createIndex('by-dayId', 'dayId');
        dlmStore.createIndex('by-catalogItemId', 'catalogItemId');

        const templatesStore = db.createObjectStore('package_templates', { keyPath: 'id' });
        templatesStore.createIndex('by-userId', 'userId');

        const templateItemsStore = db.createObjectStore('template_items', { keyPath: 'id' });
        templateItemsStore.createIndex('by-templateId', 'templateId');
      }

      // ---- Version 2: User gear + App settings ----
      if (oldVersion < 2) {
        const userGearStore = db.createObjectStore('user_gear', { keyPath: 'id' });
        userGearStore.createIndex('by-userId', 'userId');
        userGearStore.createIndex('by-catalogItemId', 'catalogItemId');

        db.createObjectStore('app_settings', { keyPath: 'key' });
      }

      // ---- Version 3: Project members + by-userId on general lists ----
      if (oldVersion < 3) {
        const membersStore = db.createObjectStore('project_members', { keyPath: 'id' });
        membersStore.createIndex('by-projectId', 'projectId');
        membersStore.createIndex('by-userId', 'userId');

        const pglStore = transaction.objectStore('project_general_lists');
        pglStore.createIndex('by-userId', 'userId');
      }
    },
  });

  return dbInstance;
}
