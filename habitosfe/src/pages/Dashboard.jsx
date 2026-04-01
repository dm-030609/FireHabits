import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import WeeklyBar from "../components/WeeklyBar.jsx";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import {
  salvarProgressoSemana,
  carregarProgressoSemana,
  initDB,
  salvarDiarioLocal,
  pegarDiarioDia,
} from "../utils/indexedDB.js";
import { salvarAcaoPendente } from "../utils/syncDB.js";

const inputStyle = {
  backgroundColor: '#111',
  color: '#ccc',
  border: '1px solid #333',
  borderRadius: '8px',
  fontSize: '1rem',
  padding: '10px 12px',
};

function Dashboard() {
  const [dadosSemana, setDadosSemana] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [dashTab, setDashTab] = useState('Construtivo');

  // Modal do Diário
  const [showDiario, setShowDiario] = useState(false);
  const [diarioData, setDiarioData] = useState('');
  const [diarioConteudo, setDiarioConteudo] = useState('');
  const [diarioId, setDiarioId] = useState(null);
  const [diarioSalvando, setDiarioSalvando] = useState(false);
  const [diarioLoading, setDiarioLoading] = useState(false);
  const [diarioStatus, setDiarioStatus] = useState('');

  const abrirDiario = useCallback(async (data) => {
    setDiarioData(data);
    setDiarioConteudo('');
    setDiarioId(null);
    setDiarioStatus('');
    setShowDiario(true);
    setDiarioLoading(true);

    try {
      if (navigator.onLine) {
        const res = await axios.get(`/diario?data=${data}`);
        if (res.data.length > 0) {
          setDiarioConteudo(res.data[0].conteudo);
          setDiarioId(res.data[0]._id);
          await salvarDiarioLocal({ data, conteudo: res.data[0].conteudo, _id: res.data[0]._id });
        } else {
          const local = await pegarDiarioDia(data);
          if (local) {
            setDiarioConteudo(local.conteudo || '');
            setDiarioId(local._id || null);
          }
        }
      } else {
        const local = await pegarDiarioDia(data);
        if (local) {
          setDiarioConteudo(local.conteudo || '');
          setDiarioId(local._id || null);
        }
      }
    } catch {
      const local = await pegarDiarioDia(data);
      if (local) {
        setDiarioConteudo(local.conteudo || '');
        setDiarioId(local._id || null);
      }
    } finally {
      setDiarioLoading(false);
    }
  }, []);

  const salvarDiario = async () => {
    if (!diarioConteudo.trim()) return;
    setDiarioSalvando(true);
    setDiarioStatus('');

    try {
      await salvarDiarioLocal({ data: diarioData, conteudo: diarioConteudo, _id: diarioId });

      if (navigator.onLine) {
        const res = await axios.post('/diario', { data: diarioData, conteudo: diarioConteudo });
        setDiarioId(res.data._id);
        await salvarDiarioLocal({ data: diarioData, conteudo: diarioConteudo, _id: res.data._id });
        setDiarioStatus('Salvo');
      } else {
        await salvarAcaoPendente({
          type: 'salvar-diario',
          data: diarioData,
          conteudo: diarioConteudo,
          timestamp: Date.now(),
        });
        setDiarioStatus('Salvo offline');
      }
    } catch {
      setDiarioStatus('Erro ao salvar');
    } finally {
      setDiarioSalvando(false);
      setTimeout(() => setDiarioStatus(''), 3000);
    }
  };

  const fetchProgresso = async () => {
    try {
      if (navigator.onLine) {
        const response = await axios.get("/progresso/semana");
        const dados = response.data;
        await salvarProgressoSemana(dados);
        setDadosSemana(dados);
        setLoading(false);
      } else {
        const cache = await carregarProgressoSemana();
        setDadosSemana(cache);
        setLoading(false);
      }
    } catch (err) {
      console.error("Erro ao carregar progresso:", err);
      const cache = await carregarProgressoSemana();
      setDadosSemana(cache);
      setLoading(false);
    }
  };

  useEffect(() => {
    initDB().then(() => fetchProgresso());

    const onlineHandler = () => {
      setIsOffline(false);
      fetchProgresso();
    };
    const offlineHandler = () => setIsOffline(true);

    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);
    return () => {
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div style={{ backgroundColor: '#111', minHeight: '100vh', paddingBottom: '80px' }}>
        <PageHeader titulo="Stats" />
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
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
          <p style={{ color: '#666', marginTop: '16px', fontSize: '0.9rem' }}>Carregando progresso...</p>
        </div>
      </div>
    );
  }

  if (!dadosSemana || !dadosSemana.habitos) {
    return (
      <div style={{ backgroundColor: '#111', minHeight: '100vh', paddingBottom: '80px' }}>
        <PageHeader titulo="Stats" />
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>Nenhum dado disponível.</p>
        </div>
      </div>
    );
  }

  const habitos = dadosSemana.habitos;

  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh', paddingBottom: '80px' }}>
      <PageHeader titulo="Stats" />

      <div style={{ maxWidth: '620px', margin: '0 auto', padding: '16px' }}>

        {/* Toggle Construtivo / Destrutivo */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '20px',
          backgroundColor: '#0a0a0a',
          borderRadius: '10px',
          padding: '4px',
        }}>
          {[
            { key: 'Construtivo', label: 'Progresso Positivo', color: '#4caf50' },
            { key: 'Destrutivo', label: 'Anti-Recaída', color: '#ff6600' },
          ].map((tab) => {
            const ativo = dashTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setDashTab(tab.key)}
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
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Weekly Progress */}
        <h3 style={{
          color: '#fff',
          textAlign: 'center',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          marginBottom: '16px',
          marginTop: '24px',
        }}>
          {dashTab === 'Destrutivo' ? 'Registro Semanal' : 'Progresso Semanal'}
        </h3>

        {habitos
          .filter((hab) => (hab.tipo || 'Construtivo') === dashTab)
          .map((hab) => (
          <WeeklyBar
            key={hab.habitoId}
            nome={hab.nome}
            progresso={hab.progresso}
            semanal={hab.semanal}
            total={hab.total}
            datas={dadosSemana.datas}
            onDayClick={abrirDiario}
          />
        ))}

        {habitos.filter((hab) => (hab.tipo || 'Construtivo') === dashTab).length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#555' }}>
            <p style={{ fontSize: '0.9rem' }}>
              {dashTab === 'Destrutivo'
                ? 'Nenhum hábito destrutivo rastreado ainda.'
                : 'Nenhum hábito construtivo ainda.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal Diário - Custom (sem Bootstrap Modal) */}
      {showDiario && (
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
          onClick={(e) => { if (e.target === e.currentTarget) setShowDiario(false); }}
        >
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            border: '1px solid #333',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            {/* Header */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h5 style={{ color: '#e60000', fontWeight: 'bold', margin: 0, fontSize: '1rem' }}>
                Diário — {diarioData}
              </h5>
              <button
                onClick={() => setShowDiario(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                X
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '16px' }}>
              {diarioLoading ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    border: '3px solid #333',
                    borderTopColor: '#e60000',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto',
                  }} />
                </div>
              ) : (
                <textarea
                  rows={8}
                  placeholder="Honestidade brutal. O que aconteceu nesse dia?"
                  value={diarioConteudo}
                  onChange={(e) => setDiarioConteudo(e.target.value)}
                  style={{
                    ...inputStyle,
                    width: '100%',
                    resize: 'vertical',
                    lineHeight: '1.6',
                  }}
                />
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #333',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              {diarioStatus && (
                <span style={{
                  color: diarioStatus === 'Erro ao salvar' ? '#ff4444' : '#4caf50',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  marginRight: 'auto',
                }}>
                  {diarioStatus}
                </span>
              )}
              {!diarioStatus && <span style={{ marginRight: 'auto' }} />}
              <button
                onClick={() => setShowDiario(false)}
                style={{
                  backgroundColor: '#222',
                  color: '#888',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Fechar
              </button>
              <button
                disabled={diarioSalvando || !diarioConteudo.trim()}
                onClick={salvarDiario}
                style={{
                  backgroundColor: (diarioSalvando || !diarioConteudo.trim()) ? '#333' : '#e60000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: (diarioSalvando || !diarioConteudo.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (diarioSalvando || !diarioConteudo.trim()) ? 0.5 : 1,
                }}
              >
                {diarioSalvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
