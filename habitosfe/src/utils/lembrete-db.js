// src/utils/lembrete-db.js
import { openDB } from 'idb';

const DB_NAME = 'firehabits';
const STORE_NAME = 'lembretes';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('habitoId', 'habitoId');
      }
    },
  });
}

export async function salvarLembrete(habitoId, lembrete) {
  const db = await getDB();
  await db.add(STORE_NAME, {
    habitoId,
    ...lembrete,
  });
}

export async function listarLembretesPorHabito(habitoId) {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME);
  const index = tx.store.index('habitoId');
  return index.getAll(habitoId);
}

export async function listarTodosLembretes() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function deletarLembrete(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function atualizarLembrete(lembrete) {
  const db = await getDB();
  await db.put(STORE_NAME, lembrete);
}

export async function iniciarVerificadorLembretes() {
  if (!('Notification' in window)) return;

  const permissao = await Notification.requestPermission();
  if (permissao !== 'granted') return;

  setInterval(async () => {
    const agora = new Date();
    const horaAtual = agora.toTimeString().slice(0, 5); // HH:MM
    const diaAtual = agora.getDay(); // 0-6

    const lembretes = await listarTodosLembretes();

    lembretes.forEach((l) => {
      if (l.horario === horaAtual && l.dias.includes(diaAtual)) {
        new Notification('Lembrete FireHabits', {
          body: l.mensagem,
          icon: '/icon-192x192.png',
        });
      }
    });
  }, 60000); // verifica a cada minuto
}
