import axios from 'axios';
import { initDB, salvarHabitoLocal, removerHabitoLocal } from './indexedDB';
axios.defaults.baseURL = 'http://localhost:3000';

const ACAO_STORE = 'pendentes';

export async function listarAcoesPendentes() {
  const db = await initDB();
  return db.getAll(ACAO_STORE);
}

export async function removerAcaoPendente(timestamp) {
  const db = await initDB();
  await db.delete(ACAO_STORE, timestamp);
}

export async function sincronizarAcoesPendentes() {
  const acoes = await listarAcoesPendentes();

  for (const acao of acoes) {
    try {
      let nome, descricao, frequencia, status;

      switch (acao.type) {
        case 'criar':
          ({ nome, descricao, frequencia, status } = acao.dados);

          // Envia para o backend
          const res = await axios.post(`/habitos`, {
            nome,
            descricao,
            frequencia,
            status
          });

          // Remove o hábito local antigo (com _id temporário)
          await removerHabitoLocal(acao.dados._id);

          // Salva o hábito com _id real retornado pelo backend
          if (res.data && res.data._id) {
            await salvarHabitoLocal(res.data);
          }

          break;

        case 'editar':
        case 'concluir':
          ({ nome, descricao, frequencia, status } = acao.dados);

          await axios.put(`/habitos/${acao.habitoId}`, {
            nome,
            descricao,
            frequencia,
            status
          });
          break;

        case 'excluir':
          await axios.delete(`/habitos/${acao.habitoId}`);
          break;

        default:
          console.warn('Tipo de ação desconhecido:', acao.type);
      }

      await removerAcaoPendente(acao.timestamp);
      console.log(`✔️ Ação sincronizada: ${acao.type}`, acao);

    } catch (err) {
      console.error(`❌ Falha ao sincronizar ação: ${acao.type}`, acao, err);
    }
  }
}

export function iniciarMonitorSincronizacao() {
  const tentarSync = () => {
    if (navigator.onLine) {
      sincronizarAcoesPendentes();
    }
  };

  window.addEventListener('online', tentarSync);
  setInterval(tentarSync, 10000);
}

export async function salvarAcaoPendente(acao) {
  const db = await initDB();
  await db.put('pendentes', acao);
}
