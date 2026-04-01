import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PomodoroTimer from '../components/PomodoroTimer.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { initDB, listarTarefasLocal } from '../utils/indexedDB.js';

function Pomodoro() {
  const [tarefas, setTarefas] = useState([]);
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [sessoesPorTarefa, setSessoesPorTarefa] = useState({});

  const fetchTarefas = useCallback(async () => {
    try {
      if (navigator.onLine) {
        const res = await axios.get('/tarefas?status=pendente');
        setTarefas(res.data);
      } else {
        const locais = await listarTarefasLocal();
        setTarefas(locais.filter(t => t.status === 'pendente'));
      }
    } catch {
      const locais = await listarTarefasLocal();
      setTarefas(locais.filter(t => t.status === 'pendente'));
    }
  }, []);

  useEffect(() => {
    initDB().then(() => fetchTarefas());
  }, [fetchTarefas]);

  const onSessaoCompleta = (totalSessoes) => {
    if (tarefaSelecionada) {
      setSessoesPorTarefa(prev => ({
        ...prev,
        [tarefaSelecionada._id]: (prev[tarefaSelecionada._id] || 0) + 1,
      }));
    }
  };

  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh', paddingBottom: '80px' }}>
      <PageHeader titulo="Foco" />

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '16px' }}>

        {/* Header */}
        <h2 style={{
          color: '#e60000',
          textAlign: 'center',
          marginBottom: '6px',
          fontSize: '1.5rem',
          fontWeight: 'bold',
        }}>
          Modo Execucao
        </h2>
        <p style={{
          color: '#555',
          textAlign: 'center',
          fontSize: '0.8rem',
          marginBottom: '24px',
        }}>
          Deep Work. Sem distracao. Sem desculpa.
        </p>

        {/* Seletor de tarefa */}
        {tarefas.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#888', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
              Acoplar a uma tarefa:
            </label>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '160px',
              overflowY: 'auto',
            }}>
              {/* Opcao sem tarefa */}
              <button
                onClick={() => setTarefaSelecionada(null)}
                style={{
                  backgroundColor: !tarefaSelecionada ? '#1a1a1a' : 'transparent',
                  color: !tarefaSelecionada ? '#e60000' : '#555',
                  border: !tarefaSelecionada ? '1px solid #e6000040' : '1px solid #222',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Foco livre (sem tarefa)
              </button>

              {tarefas.map((t) => {
                const selecionada = tarefaSelecionada?._id === t._id;
                const sessoesTarefa = sessoesPorTarefa[t._id] || 0;
                return (
                  <button
                    key={t._id}
                    onClick={() => setTarefaSelecionada(t)}
                    style={{
                      backgroundColor: selecionada ? '#1a1a1a' : 'transparent',
                      color: selecionada ? '#fff' : '#888',
                      border: selecionada ? '1px solid #e6000040' : '1px solid #222',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{t.titulo}</span>
                    {sessoesTarefa > 0 && (
                      <span style={{
                        backgroundColor: '#222',
                        color: '#e60000',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}>
                        {sessoesTarefa}x
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tarefa ativa */}
        {tarefaSelecionada && (
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderLeft: '3px solid #e60000',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            <span style={{ color: '#666', fontSize: '0.75rem' }}>Executando:</span>
            <p style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', margin: '4px 0 0' }}>
              {tarefaSelecionada.titulo}
            </p>
          </div>
        )}

        {/* Timer */}
        <PomodoroTimer onSessaoCompleta={onSessaoCompleta} />
      </div>
    </div>
  );
}

export default Pomodoro;
