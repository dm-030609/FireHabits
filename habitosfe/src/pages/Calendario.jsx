import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PageHeader from '../components/PageHeader.jsx';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const HORAS = [];
for (let h = 5; h <= 23; h++) {
  HORAS.push(`${String(h).padStart(2, '0')}:00`);
}

const CATEGORIAS = [
  { key: 'deep-work', label: 'Deep Work', cor: '#e60000' },
  { key: 'reuniao', label: 'Reuniao', cor: '#ff9800' },
  { key: 'treino', label: 'Treino', cor: '#4caf50' },
  { key: 'rotina', label: 'Rotina', cor: '#2196f3' },
  { key: 'livre', label: 'Livre', cor: '#9c27b0' },
];

function horaParaMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function Calendario() {
  const [blocos, setBlocos] = useState([]);
  const [diaSelecionado, setDiaSelecionado] = useState(new Date().getDay());
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formTitulo, setFormTitulo] = useState('');
  const [formInicio, setFormInicio] = useState('08:00');
  const [formFim, setFormFim] = useState('09:00');
  const [formCategoria, setFormCategoria] = useState('deep-work');
  const [editandoId, setEditandoId] = useState(null);

  const fetchBlocos = useCallback(async () => {
    try {
      if (navigator.onLine) {
        const res = await axios.get('/blocos');
        setBlocos(Array.isArray(res.data) ? res.data : []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBlocos(); }, [fetchBlocos]);

  const blocosDoDia = blocos
    .filter(b => b.diaSemana === diaSelecionado)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  const abrirForm = (bloco) => {
    if (bloco) {
      setFormTitulo(bloco.titulo);
      setFormInicio(bloco.horaInicio);
      setFormFim(bloco.horaFim);
      setFormCategoria(bloco.categoria);
      setEditandoId(bloco._id);
    } else {
      setFormTitulo('');
      setFormInicio('08:00');
      setFormFim('09:00');
      setFormCategoria('deep-work');
      setEditandoId(null);
    }
    setShowForm(true);
  };

  const salvarBloco = async () => {
    if (!formTitulo.trim()) return;
    const dados = {
      titulo: formTitulo,
      diaSemana: diaSelecionado,
      horaInicio: formInicio,
      horaFim: formFim,
      categoria: formCategoria,
      cor: CATEGORIAS.find(c => c.key === formCategoria)?.cor || '#e60000',
    };

    try {
      if (editandoId) {
        const res = await axios.put(`/blocos/${editandoId}`, dados);
        setBlocos(prev => prev.map(b => b._id === editandoId ? res.data : b));
      } else {
        const res = await axios.post('/blocos', dados);
        setBlocos(prev => [...prev, res.data]);
      }
    } catch { /* silent */ }

    setShowForm(false);
  };

  const excluirBloco = async (id) => {
    setBlocos(prev => prev.filter(b => b._id !== id));
    try { await axios.delete(`/blocos/${id}`); } catch { /* silent */ }
  };

  const catCor = (cat) => CATEGORIAS.find(c => c.key === cat)?.cor || '#555';

  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh', paddingBottom: '80px' }}>
      <PageHeader titulo="Calendario" />

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '16px' }}>

        <h2 style={{
          color: '#e60000',
          textAlign: 'center',
          marginBottom: '6px',
          fontSize: '1.5rem',
          fontWeight: 'bold',
        }}>
          Timeblocking
        </h2>
        <p style={{
          color: '#555',
          textAlign: 'center',
          fontSize: '0.8rem',
          marginBottom: '20px',
        }}>
          O que nao esta no calendario nao existe.
        </p>

        {/* Seletor de dia */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '20px',
          overflowX: 'auto',
        }}>
          {DIAS.map((dia, i) => {
            const ativo = diaSelecionado === i;
            const hojeDia = new Date().getDay() === i;
            return (
              <button
                key={i}
                onClick={() => setDiaSelecionado(i)}
                style={{
                  flex: 1,
                  minWidth: '42px',
                  padding: '8px 4px',
                  borderRadius: '8px',
                  border: hojeDia && !ativo ? '1px solid #e6000040' : ativo ? '1px solid #e60000' : '1px solid #222',
                  backgroundColor: ativo ? '#e60000' : '#1a1a1a',
                  color: ativo ? '#fff' : hojeDia ? '#e60000' : '#888',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                {dia}
              </button>
            );
          })}
        </div>

        {/* Timeline do dia */}
        <div style={{ position: 'relative', minHeight: '200px' }}>
          {blocosDoDia.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#555' }}>
              <p style={{ fontSize: '0.9rem' }}>Nenhum bloco para {DIAS[diaSelecionado]}.</p>
              <p style={{ fontSize: '0.8rem', color: '#444' }}>Toque + para agendar.</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {blocosDoDia.map((bloco) => {
              const duracao = horaParaMinutos(bloco.horaFim) - horaParaMinutos(bloco.horaInicio);
              const altura = Math.max(48, duracao * 0.8);
              return (
                <div
                  key={bloco._id}
                  onClick={() => abrirForm(bloco)}
                  style={{
                    backgroundColor: '#1a1a1a',
                    borderLeft: `4px solid ${bloco.cor || catCor(bloco.categoria)}`,
                    borderRadius: '8px',
                    padding: '12px 14px',
                    minHeight: `${altura}px`,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <div style={{
                      color: '#fff',
                      fontSize: '0.95rem',
                      fontWeight: 'bold',
                      marginBottom: '4px',
                    }}>
                      {bloco.titulo}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.8rem' }}>
                      {bloco.horaInicio} — {bloco.horaFim}
                    </div>
                    <span style={{
                      display: 'inline-block',
                      marginTop: '6px',
                      backgroundColor: '#222',
                      color: bloco.cor || catCor(bloco.categoria),
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}>
                      {bloco.categoria}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); excluirBloco(bloco._id); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#444',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    x
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAB + */}
      {!showForm && (
        <button
          onClick={() => abrirForm(null)}
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '56px',
            height: '56px',
            backgroundColor: '#e60000',
            borderRadius: '14px',
            boxShadow: '0 4px 20px rgba(230, 0, 0, 0.4)',
            zIndex: 998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: '#fff',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          +
        </button>
      )}

      {/* Modal Form */}
      {showForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            border: '1px solid #333',
            width: '100%',
            maxWidth: '400px',
            padding: '20px',
          }}>
            <h3 style={{ color: '#e60000', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '16px' }}>
              {editandoId ? 'Editar Bloco' : 'Novo Bloco'}
            </h3>

            {/* Titulo */}
            <input
              type="text"
              placeholder="Titulo do bloco"
              value={formTitulo}
              onChange={(e) => setFormTitulo(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#111',
                color: '#ccc',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '0.95rem',
                marginBottom: '12px',
                outline: 'none',
              }}
            />

            {/* Horarios */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#888', fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Inicio</label>
                <input
                  type="time"
                  value={formInicio}
                  onChange={(e) => setFormInicio(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#111',
                    color: '#ccc',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#888', fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Fim</label>
                <input
                  type="time"
                  value={formFim}
                  onChange={(e) => setFormFim(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#111',
                    color: '#ccc',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>

            {/* Categoria */}
            <div style={{
              display: 'flex',
              gap: '4px',
              flexWrap: 'wrap',
              marginBottom: '16px',
            }}>
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setFormCategoria(cat.key)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: formCategoria === cat.key ? `2px solid ${cat.cor}` : '1px solid #333',
                    backgroundColor: formCategoria === cat.key ? '#222' : 'transparent',
                    color: formCategoria === cat.key ? cat.cor : '#555',
                    fontWeight: 'bold',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Botoes */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#222',
                  color: '#888',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '10px',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={salvarBloco}
                disabled={!formTitulo.trim()}
                style={{
                  flex: 1,
                  backgroundColor: formTitulo.trim() ? '#e60000' : '#333',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: formTitulo.trim() ? 'pointer' : 'not-allowed',
                  opacity: formTitulo.trim() ? 1 : 0.5,
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendario;
