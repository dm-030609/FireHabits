import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import {
  initDB,
  salvarMultiplosHabitos,
  listarHabitosLocal,
  removerHabitoLocal,
  salvarHabitoLocal,
  salvarConclusaoDia,
  pegarConclusaoDia
} from '../utils/indexedDB.js';

import { salvarAcaoPendente } from '../utils/syncDB.js';
import StreakFlame from '../components/StreakFlame.jsx';
import Heatmap from '../components/Heatmap.jsx';
import PageHeader from '../components/PageHeader.jsx';
import FAB from '../components/FAB.jsx';

function Habitos() {
  const [habitos, setHabitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabAtiva, setTabAtiva] = useState('Construtivo');
  const navigate = useNavigate();

  const aplicarStatusDiario = useCallback(async (lista) => {
    const hoje = new Date().toISOString().split("T")[0];
    const novaLista = [];
    for (const h of lista) {
      const concluido = await pegarConclusaoDia(h._id, hoje);
      novaLista.push({
        ...h,
        statusHoje: concluido ? "Concluído" : "Pendente"
      });
    }
    return novaLista;
  }, []);

  const fetchHabitos = useCallback(async () => {
    try {
      const res = await axios.get('/habitos');
      let lista = Array.isArray(res.data) ? res.data : [];
      await salvarMultiplosHabitos(lista);
      lista = await aplicarStatusDiario(lista);
      setHabitos(lista);
    } catch (err) {
      console.warn("Backend falhou, carregando IndexedDB");
      let locais = await listarHabitosLocal();
      locais = await aplicarStatusDiario(locais);
      setHabitos(locais);
    } finally {
      setLoading(false);
    }
  }, [aplicarStatusDiario]);

  useEffect(() => {
    const start = async () => {
      await initDB();
      await fetchHabitos();
    };
    start();
  }, [fetchHabitos]);

  const concluirHabito = async (id) => {
    try {
      const hoje = new Date().toISOString().split("T")[0];
      const habitoAtual = habitos.find(h => h._id === id);
      if (!habitoAtual) throw new Error("Hábito não encontrado");

      await salvarConclusaoDia(id, hoje);

      const habitoUpdate = { ...habitoAtual, statusHoje: "Concluído" };
      setHabitos(prev => prev.map(h => h._id === id ? habitoUpdate : h));
      await salvarHabitoLocal(habitoUpdate);

      if (navigator.onLine) {
        await axios.post(`/registro`, { habitoId: id, data: hoje });
      } else {
        await salvarAcaoPendente({
          type: 'concluir-dia',
          habitoId: id,
          data: hoje,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.error("Erro ao concluir hábito:", err);
    }
  };

  const excluirHabito = async (id) => {
    try {
      if (navigator.onLine) {
        await axios.delete(`/habitos/${id}`);
      }
      setHabitos(prev => prev.filter(h => h._id !== id));
      await removerHabitoLocal(id);
    } catch (err) {
      console.error("Erro ao excluir:", err);
    }
  };

  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh', paddingBottom: '80px' }}>
      <PageHeader titulo="Habitos" />

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '16px' }}>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '20px',
          backgroundColor: '#0a0a0a',
          borderRadius: '10px',
          padding: '4px',
        }}>
          {[
            { key: 'Construtivo', label: 'Construtivos', color: '#4caf50' },
            { key: 'Destrutivo', label: 'Destrutivos', color: '#ff6600' },
          ].map((tab) => {
            const ativo = tabAtiva === tab.key;
            const count = habitos.filter(h => (h.tipo || 'Construtivo') === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setTabAtiva(tab.key)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: ativo ? '#1a1a1a' : 'transparent',
                  color: ativo ? tab.color : '#555',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label} {count > 0 && <span style={{ opacity: 0.6 }}>({count})</span>}
              </button>
            );
          })}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #333',
              borderTopColor: '#e60000',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {habitos
            .filter(h => (h.tipo || 'Construtivo') === tabAtiva)
            .map((habito) => {
            const concluido = habito.statusHoje === 'Concluído';
            const isDestr = tabAtiva === 'Destrutivo';
            const accentColor = isDestr ? '#ff6600' : '#e60000';
            const doneColor = isDestr ? '#4caf50' : '#4caf50';
            return (
              <div
                key={habito._id}
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '10px',
                  padding: '16px',
                  borderLeft: `3px solid ${concluido ? doneColor : accentColor}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                      {habito.nome}
                    </h3>
                    {habito.descricao && (
                      <p style={{ color: '#777', fontSize: '0.85rem', margin: '0 0 6px 0' }}>{habito.descricao}</p>
                    )}
                  </div>
                  <StreakFlame streak={habito.streakAtual} />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <span style={{
                    backgroundColor: '#222',
                    color: '#999',
                    fontSize: '0.75rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                  }}>
                    {habito.frequencia}
                  </span>
                  <span style={{
                    backgroundColor: concluido ? '#1a2e1a' : (isDestr ? '#1a1000' : '#2a1a1a'),
                    color: concluido ? '#4caf50' : accentColor,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    padding: '3px 8px',
                    borderRadius: '4px',
                  }}>
                    {concluido
                      ? (isDestr ? 'Resisti' : 'Concluído')
                      : (isDestr ? 'Pendente' : 'Pendente')
                    }
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => navigate(`/editar/${habito._id}`)}
                    style={{
                      flex: 1,
                      backgroundColor: '#222',
                      color: '#ccc',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      padding: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Editar
                  </button>
                  <button
                    disabled={concluido}
                    onClick={() => concluirHabito(habito._id)}
                    style={{
                      flex: 1,
                      backgroundColor: concluido ? '#333' : accentColor,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: concluido ? 'not-allowed' : 'pointer',
                      opacity: concluido ? 0.5 : 1,
                    }}
                  >
                    {concluido
                      ? (isDestr ? 'Resisti' : 'Feito')
                      : (isDestr ? 'Evitei' : 'Concluir')
                    }
                  </button>
                  <button
                    onClick={() => excluirHabito(habito._id)}
                    style={{
                      backgroundColor: '#1a1a1a',
                      color: '#666',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Excluir
                  </button>
                </div>

                {/* Heatmap individual do hábito */}
                <Heatmap habitoId={habito._id} refreshTrigger={habito.statusHoje} compact />
              </div>
            );
          })}

          {!loading && habitos.filter(h => (h.tipo || 'Construtivo') === tabAtiva).length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#555' }}>
              <p style={{ fontSize: '0.95rem' }}>
                {tabAtiva === 'Destrutivo'
                  ? 'Nenhum hábito destrutivo rastreado.'
                  : 'Nenhum hábito construtivo ainda.'}
              </p>
              <p style={{ fontSize: '0.85rem', color: '#444' }}>Crie um novo hábito abaixo.</p>
            </div>
          )}
        </div>
      </div>

      <FAB to="/criar" />
    </div>
  );
}

export default Habitos;
