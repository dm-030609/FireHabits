import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  initDB,
  salvarMultiplasTarefas,
  listarTarefasLocal,
  salvarTarefaLocal,
  removerTarefaLocal,
} from '../utils/indexedDB.js';
import { salvarAcaoPendente } from '../utils/syncDB.js';
import PageHeader from '../components/PageHeader.jsx';

const prioridadeCores = {
  alta: '#e60000',
  media: '#ff9800',
  baixa: '#4caf50',
};

function Tarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaPrioridade, setNovaPrioridade] = useState('media');
  const [tabAtiva, setTabAtiva] = useState('pendente');

  const fetchTarefas = useCallback(async () => {
    try {
      if (navigator.onLine) {
        const res = await axios.get('/tarefas');
        await salvarMultiplasTarefas(res.data);
        setTarefas(res.data);
      } else {
        const locais = await listarTarefasLocal();
        setTarefas(locais);
      }
    } catch {
      const locais = await listarTarefasLocal();
      setTarefas(locais);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initDB().then(() => fetchTarefas());
  }, [fetchTarefas]);

  const criarTarefa = async () => {
    const titulo = novoTitulo.trim();
    if (!titulo) return;

    const tempId = `temp_${Date.now()}`;
    const novaTarefa = {
      _id: tempId,
      titulo,
      prioridade: novaPrioridade,
      status: 'pendente',
      createdAt: new Date().toISOString(),
    };

    setTarefas(prev => [novaTarefa, ...prev]);
    setNovoTitulo('');
    await salvarTarefaLocal(novaTarefa);

    try {
      if (navigator.onLine) {
        const res = await axios.post('/tarefas', { titulo, prioridade: novaPrioridade });
        await removerTarefaLocal(tempId);
        await salvarTarefaLocal(res.data);
        setTarefas(prev => prev.map(t => t._id === tempId ? res.data : t));
      } else {
        await salvarAcaoPendente({
          type: 'criar-tarefa',
          dados: novaTarefa,
          timestamp: Date.now(),
        });
      }
    } catch {
      // Mantém local
    }
  };

  const concluirTarefa = async (id) => {
    setTarefas(prev => prev.map(t =>
      t._id === id ? { ...t, status: 'concluida', concluidaEm: new Date().toISOString() } : t
    ));

    const tarefa = tarefas.find(t => t._id === id);
    if (tarefa) await salvarTarefaLocal({ ...tarefa, status: 'concluida', concluidaEm: new Date().toISOString() });

    try {
      if (navigator.onLine) {
        await axios.put(`/tarefas/${id}`, { status: 'concluida' });
      } else {
        await salvarAcaoPendente({ type: 'concluir-tarefa', tarefaId: id, timestamp: Date.now() });
      }
    } catch { /* mantém local */ }
  };

  const reativarTarefa = async (id) => {
    setTarefas(prev => prev.map(t =>
      t._id === id ? { ...t, status: 'pendente', concluidaEm: null } : t
    ));

    const tarefa = tarefas.find(t => t._id === id);
    if (tarefa) await salvarTarefaLocal({ ...tarefa, status: 'pendente', concluidaEm: null });

    try {
      if (navigator.onLine) {
        await axios.put(`/tarefas/${id}`, { status: 'pendente', concluidaEm: null });
      }
    } catch { /* mantém local */ }
  };

  const alterarPrioridade = async (id, novaPrio) => {
    setTarefas(prev => prev.map(t =>
      t._id === id ? { ...t, prioridade: novaPrio } : t
    ));

    const tarefa = tarefas.find(t => t._id === id);
    if (tarefa) await salvarTarefaLocal({ ...tarefa, prioridade: novaPrio });

    try {
      if (navigator.onLine) {
        await axios.put(`/tarefas/${id}`, { prioridade: novaPrio });
      } else {
        await salvarAcaoPendente({ type: 'editar-tarefa', tarefaId: id, dados: { prioridade: novaPrio }, timestamp: Date.now() });
      }
    } catch { /* mantém local */ }
  };

  const excluirTarefa = async (id) => {
    setTarefas(prev => prev.filter(t => t._id !== id));
    await removerTarefaLocal(id);

    try {
      if (navigator.onLine) {
        await axios.delete(`/tarefas/${id}`);
      } else {
        await salvarAcaoPendente({ type: 'excluir-tarefa', tarefaId: id, timestamp: Date.now() });
      }
    } catch { /* já removido local */ }
  };

  const tarefasFiltradas = tarefas.filter(t => t.status === tabAtiva);
  const pendentes = tarefas.filter(t => t.status === 'pendente').length;
  const concluidas = tarefas.filter(t => t.status === 'concluida').length;

  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh', paddingBottom: '80px' }}>
      <PageHeader titulo="Tarefas" />

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '16px' }}>

        {/* Header */}
        <h2 style={{
          color: '#e60000',
          textAlign: 'center',
          marginBottom: '6px',
          fontSize: '1.5rem',
          fontWeight: 'bold',
        }}>
          Descarrego Mental
        </h2>
        <p style={{
          color: '#555',
          textAlign: 'center',
          fontSize: '0.8rem',
          marginBottom: '20px',
        }}>
          Esvazie a mente. Capture tudo. Execute depois.
        </p>

        {/* Input de captura rapida */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
        }}>
          <input
            type="text"
            placeholder="O que esta na sua cabeca?"
            value={novoTitulo}
            onChange={(e) => setNovoTitulo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && criarTarefa()}
            style={{
              flex: 1,
              backgroundColor: '#1a1a1a',
              color: '#ccc',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          <button
            onClick={criarTarefa}
            disabled={!novoTitulo.trim()}
            style={{
              backgroundColor: novoTitulo.trim() ? '#e60000' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 16px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              cursor: novoTitulo.trim() ? 'pointer' : 'not-allowed',
              opacity: novoTitulo.trim() ? 1 : 0.5,
            }}
          >
            +
          </button>
        </div>

        {/* Seletor de prioridade */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '20px',
        }}>
          {[
            { key: 'baixa', label: 'Baixa' },
            { key: 'media', label: 'Media' },
            { key: 'alta', label: 'Alta' },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setNovaPrioridade(p.key)}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: '6px',
                border: novaPrioridade === p.key ? `2px solid ${prioridadeCores[p.key]}` : '1px solid #333',
                backgroundColor: novaPrioridade === p.key ? '#1a1a1a' : 'transparent',
                color: novaPrioridade === p.key ? prioridadeCores[p.key] : '#555',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '16px',
          backgroundColor: '#0a0a0a',
          borderRadius: '10px',
          padding: '4px',
        }}>
          {[
            { key: 'pendente', label: 'Pendentes', count: pendentes, color: '#e60000' },
            { key: 'concluida', label: 'Concluidas', count: concluidas, color: '#4caf50' },
          ].map((tab) => {
            const ativo = tabAtiva === tab.key;
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
                {tab.label} {tab.count > 0 && <span style={{ opacity: 0.6 }}>({tab.count})</span>}
              </button>
            );
          })}
        </div>

        {/* Loading */}
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

        {/* Lista de tarefas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tarefasFiltradas.map((tarefa) => (
            <div
              key={tarefa._id}
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '10px',
                padding: '14px 16px',
                borderLeft: `3px solid ${prioridadeCores[tarefa.prioridade] || '#555'}`,
                opacity: tarefa.status === 'concluida' ? 0.7 : 1,
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                {/* Checkbox visual */}
                <button
                  onClick={() => tarefa.status === 'pendente' ? concluirTarefa(tarefa._id) : reativarTarefa(tarefa._id)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `2px solid ${tarefa.status === 'concluida' ? '#4caf50' : '#555'}`,
                    backgroundColor: tarefa.status === 'concluida' ? '#4caf50' : 'transparent',
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                  }}
                >
                  {tarefa.status === 'concluida' ? '\u2713' : ''}
                </button>

                {/* Titulo */}
                <span style={{
                  flex: 1,
                  color: tarefa.status === 'concluida' ? '#666' : '#ddd',
                  fontSize: '0.95rem',
                  textDecoration: tarefa.status === 'concluida' ? 'line-through' : 'none',
                }}>
                  {tarefa.titulo}
                </span>

                {/* Excluir */}
                <button
                  onClick={() => excluirTarefa(tarefa._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#444',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    padding: '4px',
                    flexShrink: 0,
                  }}
                >
                  x
                </button>
              </div>

              {/* Prioridade seletor inline */}
              <div style={{ marginTop: '6px', marginLeft: '36px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {['baixa', 'media', 'alta'].map((p) => (
                  <button
                    key={p}
                    onClick={() => alterarPrioridade(tarefa._id, p)}
                    style={{
                      backgroundColor: tarefa.prioridade === p ? '#222' : 'transparent',
                      color: tarefa.prioridade === p ? prioridadeCores[p] : '#333',
                      border: tarefa.prioridade === p ? `1px solid ${prioridadeCores[p]}40` : '1px solid transparent',
                      borderRadius: '4px',
                      padding: '1px 8px',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    {p}
                  </button>
                ))}
                {tarefa.concluidaEm && (
                  <span style={{
                    color: '#555',
                    fontSize: '0.7rem',
                    marginLeft: '4px',
                  }}>
                    {new Date(tarefa.concluidaEm).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>
          ))}

          {!loading && tarefasFiltradas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#555' }}>
              <p style={{ fontSize: '0.95rem' }}>
                {tabAtiva === 'pendente'
                  ? 'Mente limpa. Nenhuma pendencia.'
                  : 'Nenhuma tarefa concluida ainda.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Tarefas;
