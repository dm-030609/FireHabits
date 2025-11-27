import { openDB } from 'idb';

const DB_NAME = 'fireHabitsDB';
const DB_VERSION = 5;

// Stores
const HABITO_STORE = 'habitos';
const ACAO_STORE = 'pendentes';
const LEMBRETE_STORE = 'lembretes';
const CONCLUSAO_STORE = 'conclusoes';
const STORE_PROGRESO = 'progressoSemana';

// Cache para evitar inicialização múltipla
let dbCache = null;

/* ============================================
   Inicialização PRO — apenas 1 vez
============================================ */
export async function initDB() {
  if (dbCache) return dbCache; // Evita recriar / re-logar

  dbCache = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      console.log(`🔄 IndexedDB upgrade: ${oldVersion} → ${DB_VERSION}`);

      // 1) Hábitos
      if (!db.objectStoreNames.contains(HABITO_STORE)) {
        db.createObjectStore(HABITO_STORE, { keyPath: '_id' });
      }

      // 2) Ações pendentes para sync offline
      if (!db.objectStoreNames.contains(ACAO_STORE)) {
        db.createObjectStore(ACAO_STORE, { keyPath: 'timestamp' });
      }

      // 3) Lembretes
      if (!db.objectStoreNames.contains(LEMBRETE_STORE)) {
        const lemb = db.createObjectStore(LEMBRETE_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        lemb.createIndex('habitoId', 'habitoId');
      }

      // 4) Conclusões diárias
      if (!db.objectStoreNames.contains(CONCLUSAO_STORE)) {
        db.createObjectStore(CONCLUSAO_STORE);
      }

      // 5) Progresso semanal
      if (!db.objectStoreNames.contains(STORE_PROGRESO)) {
        db.createObjectStore(STORE_PROGRESO);
      }
    },
  });

  return dbCache;
}

/* ============================================
   HÁBITOS
============================================ */
export async function salvarHabitoLocal(habito) {
  const db = await initDB();
  if (!habito._id) throw new Error("Hábito precisa de _id");
  await db.put(HABITO_STORE, habito);
}

export async function salvarMultiplosHabitos(habitos) {
  const db = await initDB();
  const tx = db.transaction(HABITO_STORE, 'readwrite');
  for (const h of habitos) {
    if (h._id) tx.store.put(h);
  }
  await tx.done;
}

export async function listarHabitosLocal() {
  const db = await initDB();
  return await db.getAll(HABITO_STORE);
}

export async function removerHabitoLocal(id) {
  const db = await initDB();
  await db.delete(HABITO_STORE, id);
}

/* ============================================
   Conclusões diárias
============================================ */
export async function salvarConclusaoDia(habitoId, data) {
  const db = await initDB();
  const chave = `${habitoId}-${data}`;
  await db.put(CONCLUSAO_STORE, { habitoId, data }, chave);
}

export async function pegarConclusaoDia(habitoId, data) {
  const db = await initDB();
  const chave = `${habitoId}-${data}`;
  return await db.get(CONCLUSAO_STORE, chave);
}

export async function removerConclusaoDia(habitoId, data) {
  const db = await initDB();
  const chave = `${habitoId}-${data}`;
  await db.delete(CONCLUSAO_STORE, chave);
}

/* ============================================
   Progresso semanal
============================================ */
export async function salvarProgressoSemana(dados) {
  try {
    const db = await initDB();
    await db.put(STORE_PROGRESO, dados, "semanaAtual");
    console.log("💾 Progresso semanal salvo.");
  } catch (err) {
    console.error("❌ Erro ao salvar progresso semanal:", err);
  }
}

export async function carregarProgressoSemana() {
  try {
    const db = await initDB();
    return await db.get(STORE_PROGRESO, "semanaAtual") || null;
  } catch (err) {
    console.error("❌ Erro ao carregar progresso semanal:", err);
    return null;
  }
}
