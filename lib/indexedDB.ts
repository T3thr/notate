import { openDB } from 'idb';

export async function getDB() {
  return openDB('offline-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
    },
  });
}

export async function saveTaskOffline(task: any) {
  const db = await getDB();
  await db.put('tasks', task);
}

export async function getOfflineTasks() {
  const db = await getDB();
  return await db.getAll('tasks');
}
