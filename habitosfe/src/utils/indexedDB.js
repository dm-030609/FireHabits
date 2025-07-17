import { openDB } from 'idb';


const DB_NAME = 'fireHabitsDB';
const DB_VERSION = 2;

const HABITO_STORE = 'habitos';
const ACAO_STORE = 'pendentes';
const LEMBRETE_STORE = 'lembretes';

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(HABITO_STORE)) {
        db.createObjectStore(HABITO_STORE, { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains(ACAO_STORE)) {
        db.createObjectStore(ACAO_STORE, { keyPath: 'timestamp' });
      }
      if (!db.objectStoreNames.contains('lembretes')) {
        const lembreteStore = db.createObjectStore('lembretes', {
          keyPath: 'id',
          autoIncrement: true,
        });
        lembreteStore.createIndex('habitoId', 'habitoId');
      }
    },
  });
}

export async function salvarHabitoLocal(habito) {
  const db = await initDB();
  if (!habito._id) throw new Error("Hábito precisa de _id");
  await db.put(HABITO_STORE, habito);
}

export async function salvarMultiplosHabitos(habitos) {
  const db = await initDB();
  const tx = db.transaction(HABITO_STORE, 'readwrite');
  for (const habito of habitos) {
    if (habito._id) tx.store.put(habito);
  }
  await tx.done;
}

export async function listarHabitosLocal() {
  const db = await initDB();
  return db.getAll(HABITO_STORE);
}

export async function removerHabitoLocal(id) {
  const db = await initDB();
  await db.delete(HABITO_STORE, id);
}

export async function limparHabitosLocal() {
  const db = await initDB();
  await db.clear(HABITO_STORE);
}


