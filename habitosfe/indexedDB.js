import { openDB } from 'idb';

const DB_NAME = 'fireHabitsDB';
const STORE_NAME = 'habitos';

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: '_id' });
      }
    },
  });
}

export async function salvarHabitoLocal(habito) {
  const db = await initDB();
  await db.put(STORE_NAME, habito);
}

export async function salvarMultiplosHabitos(habitos) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  for (const habito of habitos) {
    tx.store.put(habito);
  }
  await tx.done;
}

export async function listarHabitosLocal() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function removerHabitoLocal(id) {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
}

export async function limparHabitosLocal() {
  const db = await initDB();
  await db.clear(STORE_NAME);
}