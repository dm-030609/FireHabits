// src/utils/lembrete-db.js
import { initDB } from './indexedDB';

const STORE_NAME = 'lembretes';

export async function salvarLembrete(habitoId, lembrete) {
  const db = await initDB();
  await db.add(STORE_NAME, {
    habitoId,
    ...lembrete,
  });
}

export async function listarLembretesPorHabito(habitoId) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME);
  const index = tx.store.index('habitoId');
  return index.getAll(habitoId);
}

export async function listarTodosLembretes() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function deletarLembrete(id) {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
}

export async function atualizarLembrete(lembrete) {
  const db = await initDB();
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
