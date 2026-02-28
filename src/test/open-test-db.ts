import 'fake-indexeddb/auto';
import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { PrepShotDB } from '@/lib/db/schema';
import { DB_VERSION } from '@/lib/db/schema';

let counter = 0;

/** Opens a fresh in-memory IndexedDB for each test (unique name per call). */
export async function openTestDB(): Promise<IDBPDatabase<PrepShotDB>> {
  const dbName = `prepshot-test-${++counter}`;
  return openDB<PrepShotDB>(dbName, DB_VERSION, {
    upgrade(db, oldVersion, _newVersion, transaction) {
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

      if (oldVersion < 2) {
        const userGearStore = db.createObjectStore('user_gear', { keyPath: 'id' });
        userGearStore.createIndex('by-userId', 'userId');
        userGearStore.createIndex('by-catalogItemId', 'catalogItemId');

        db.createObjectStore('app_settings', { keyPath: 'key' });
      }

      if (oldVersion < 3) {
        const membersStore = db.createObjectStore('project_members', { keyPath: 'id' });
        membersStore.createIndex('by-projectId', 'projectId');
        membersStore.createIndex('by-userId', 'userId');

        const pglStore = transaction.objectStore('project_general_lists');
        pglStore.createIndex('by-userId', 'userId');
      }
    },
  });
}
