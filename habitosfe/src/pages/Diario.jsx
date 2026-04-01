import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { initDB, salvarDiarioLocal, pegarDiarioDia } from '../utils/indexedDB.js';
import { salvarAcaoPendente } from '../utils/syncDB.js';

const navStyle = {
  backgroundColor: '#0a0a0a',
  borderBottom: '1px solid #222',
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

const navLinkStyle = {
  color: '#888',
  textDecoration: 'none',
  fontSize: '0.85rem',
  fontWeight: 'bold',
  padding: '6px 12px',
  borderRadius: '6px',
};

const navLinkActiveStyle = {
  ...navLinkStyle,
  color: '#e60000',
};

const inputStyle = {
  backgroundColor: '#111',
  color: '#ccc',
  border: '1px solid #333',
  borderRadius: '8px',
  fontSize: '1rem',
  padding: '10px 12px',
};

function Diario() {
  const hoje = new Date().toISOString().split('T')[0];
  const [dataSelecionada, setDataSelecionada] = useState(hoje);
  const [conteudo, setConteudo] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entradaId, setEntradaId] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  const carregarEntrada = useCallback(async (data) => {
    setLoading(true);
    setStatusMsg('');
    try {
      if (navigator.onLine) {
        const res = await axios.get(`/diario?data=${data}`);
        if (res.data.length > 0) {
          const entrada = res.data[0];
          setConteudo(entrada.conteudo);
          setEntradaId(entrada._id);
          await salvarDiarioLocal({ data, conteudo: entrada.conteudo, _id: entrada._id });
        } else {
          const local = await pegarDiarioDia(data);
          setConteudo(local?.conteudo || '');
          setEntradaId(local?._id || null);
        }
      } else {
        const local = await pegarDiarioDia(data);
        setConteudo(local?.conteudo || '');
        setEntradaId(local?._id || null);
      }
    } catch {
      const local = await pegarDiarioDia(data);
      setConteudo(local?.conteudo || '');
      setEntradaId(local?._id || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const start = async () => {
      await initDB();
      await carregarEntrada(dataSelecionada);
    };
    start();
  }, [dataSelecionada, carregarEntrada]);

  const salvar = async () => {
    if (!conteudo.trim()) return;
    setSalvando(true);
    setStatusMsg('');

    try {
      await salvarDiarioLocal({ data: dataSelecionada, conteudo, _id: entradaId });

      if (navigator.onLine) {
        const res = await axios.post('/diario', {
          data: dataSelecionada,
          conteudo,
        });
        setEntradaId(res.data._id);
        await salvarDiarioLocal({ data: dataSelecionada, conteudo, _id: res.data._id });
        setStatusMsg('Salvo');
      } else {
        await salvarAcaoPendente({
          type: 'salvar-diario',
          data: dataSelecionada,
          conteudo,
          timestamp: Date.now(),
        });
        setStatusMsg('Salvo offline');
      }
    } catch (err) {
      console.error('Erro ao salvar diário:', err);
      setStatusMsg('Erro ao salvar');
    } finally {
      setSalvando(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={navStyle}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ color: '#e60000', fontWeight: 'bold', fontSize: '1.1rem' }}>FireHabits</span>
        </Link>
        <div style={{ display: 'flex', gap: '4px' }}>
          <Link to="/habitos" style={navLinkStyle}>Hábitos</Link>
          <Link to="/dashboard" style={navLinkStyle}>Dashboard</Link>
          <Link to="/diario" style={navLinkActiveStyle}>Diário</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '16px' }}>
        <h2 style={{
          color: '#e60000',
          textAlign: 'center',
          marginBottom: '20px',
          fontSize: '1.5rem',
          fontWeight: 'bold',
        }}>
          Diário de Evolução
        </h2>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <input
            type="date"
            value={dataSelecionada}
            onChange={(e) => setDataSelecionada(e.target.value)}
            style={{
              ...inputStyle,
              textAlign: 'center',
              width: '200px',
            }}
          />
        </div>

        {loading ? (
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
        ) : (
          <>
            <textarea
              rows={12}
              placeholder="Honestidade brutal. O que aconteceu hoje? O que você sentiu? O que precisa mudar?"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              style={{
                ...inputStyle,
                width: '100%',
                resize: 'vertical',
                lineHeight: '1.6',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
              <button
                onClick={salvar}
                disabled={salvando || !conteudo.trim()}
                style={{
                  backgroundColor: (salvando || !conteudo.trim()) ? '#333' : '#e60000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  cursor: (salvando || !conteudo.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (salvando || !conteudo.trim()) ? 0.5 : 1,
                }}
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>

              {statusMsg && (
                <span style={{
                  color: statusMsg === 'Erro ao salvar' ? '#ff4444' : '#4caf50',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                }}>
                  {statusMsg}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Diario;
