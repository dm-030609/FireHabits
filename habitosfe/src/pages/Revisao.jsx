import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PageHeader from '../components/PageHeader.jsx';
import { initDB, salvarDiarioLocal, pegarDiarioDia } from '../utils/indexedDB.js';
import { salvarAcaoPendente } from '../utils/syncDB.js';

function Revisao() {
  const [modo, setModo] = useState('diario'); // 'diario' | 'semanal'
  const [loading, setLoading] = useState(true);

  // Daily review
  const [notaDia, setNotaDia] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [habitosHoje, setHabitosHoje] = useState({ total: 0, feitos: 0 });

  // Weekly review
  const [dadosSemana, setDadosSemana] = useState(null);
  const [notaSemana, setNotaSemana] = useState('');

  const hoje = new Date().toISOString().split('T')[0];

  const fetchDados = useCallback(async () => {
    setLoading(true);
    try {
      await initDB();

      // Carregar nota do diario de hoje
      if (navigator.onLine) {
        const resDiario = await axios.get(`/diario?data=${hoje}`);
        if (resDiario.data.length > 0) {
          setNotaDia(resDiario.data[0].conteudo);
        } else {
          const local = await pegarDiarioDia(hoje);
          setNotaDia(local?.conteudo || '');
        }
      } else {
        const local = await pegarDiarioDia(hoje);
        setNotaDia(local?.conteudo || '');
      }

      // Carregar progresso da semana
      if (navigator.onLine) {
        const resProg = await axios.get('/progresso/semana');
        setDadosSemana(resProg.data);

        // Calcular habitos feitos hoje
        if (resProg.data?.habitos) {
          const total = resProg.data.habitos.length;
          const datas = resProg.data.datas || [];
          const idxHoje = datas.indexOf(hoje);
          let feitos = 0;
          if (idxHoje >= 0) {
            resProg.data.habitos.forEach(h => {
              if (h.progresso && h.progresso[idxHoje]) feitos++;
            });
          }
          setHabitosHoje({ total, feitos });
        }
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [hoje]);

  useEffect(() => { fetchDados(); }, [fetchDados]);

  const salvarNota = async () => {
    if (!notaDia.trim()) return;
    setSalvando(true);
    setStatusMsg('');

    try {
      await salvarDiarioLocal({ data: hoje, conteudo: notaDia });

      if (navigator.onLine) {
        await axios.post('/diario', { data: hoje, conteudo: notaDia });
        setStatusMsg('Salvo');
      } else {
        await salvarAcaoPendente({
          type: 'salvar-diario',
          data: hoje,
          conteudo: notaDia,
          timestamp: Date.now(),
        });
        setStatusMsg('Salvo offline');
      }
    } catch {
      setStatusMsg('Erro');
    } finally {
      setSalvando(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  // Stats da semana
  const statsSemanais = (() => {
    if (!dadosSemana?.habitos) return { taxaConclusao: 0, melhorDia: '-', totalConclusoes: 0 };

    const habitos = dadosSemana.habitos;
    const datas = dadosSemana.datas || [];
    let totalPossivel = habitos.length * datas.length;
    let totalFeito = 0;
    const porDia = datas.map(() => 0);

    habitos.forEach(h => {
      if (h.progresso) {
        h.progresso.forEach((v, i) => {
          if (v) { totalFeito++; porDia[i]++; }
        });
      }
    });

    const melhorIdx = porDia.indexOf(Math.max(...porDia));
    const diasNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const melhorDia = datas[melhorIdx]
      ? diasNomes[new Date(datas[melhorIdx] + 'T12:00:00').getDay()]
      : '-';

    return {
      taxaConclusao: totalPossivel > 0 ? Math.round((totalFeito / totalPossivel) * 100) : 0,
      melhorDia,
      totalConclusoes: totalFeito,
    };
  })();

  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh', paddingBottom: '80px' }}>
      <PageHeader titulo="Revisao" />

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '16px' }}>

        <h2 style={{
          color: '#e60000',
          textAlign: 'center',
          marginBottom: '6px',
          fontSize: '1.5rem',
          fontWeight: 'bold',
        }}>
          Ritual de Revisao
        </h2>
        <p style={{
          color: '#555',
          textAlign: 'center',
          fontSize: '0.8rem',
          marginBottom: '20px',
        }}>
          A evolucao real acontece na reflexao.
        </p>

        {/* Toggle Diario / Semanal */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '20px',
          backgroundColor: '#0a0a0a',
          borderRadius: '10px',
          padding: '4px',
        }}>
          {[
            { key: 'diario', label: 'Daily Review' },
            { key: 'semanal', label: 'Weekly Review' },
          ].map((tab) => {
            const ativo = modo === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setModo(tab.key)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: ativo ? '#1a1a1a' : 'transparent',
                  color: ativo ? '#e60000' : '#555',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
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

        {/* ======= DAILY REVIEW ======= */}
        {!loading && modo === 'diario' && (
          <div>
            {/* Resumo rapido do dia */}
            <div style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-around',
              textAlign: 'center',
            }}>
              <div>
                <div style={{ color: '#e60000', fontSize: '1.8rem', fontWeight: 'bold' }}>
                  {habitosHoje.feitos}
                </div>
                <div style={{ color: '#666', fontSize: '0.75rem' }}>Feitos</div>
              </div>
              <div style={{ width: '1px', backgroundColor: '#333' }} />
              <div>
                <div style={{ color: '#888', fontSize: '1.8rem', fontWeight: 'bold' }}>
                  {habitosHoje.total}
                </div>
                <div style={{ color: '#666', fontSize: '0.75rem' }}>Total</div>
              </div>
              <div style={{ width: '1px', backgroundColor: '#333' }} />
              <div>
                <div style={{
                  color: habitosHoje.total > 0 && habitosHoje.feitos === habitosHoje.total ? '#4caf50' : '#ff9800',
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                }}>
                  {habitosHoje.total > 0 ? Math.round((habitosHoje.feitos / habitosHoje.total) * 100) : 0}%
                </div>
                <div style={{ color: '#666', fontSize: '0.75rem' }}>Taxa</div>
              </div>
            </div>

            {/* Campo de reflexao */}
            <label style={{ color: '#888', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
              Como foi o dia? O que precisa mudar?
            </label>
            <textarea
              rows={8}
              placeholder="Honestidade brutal. Sem filtro."
              value={notaDia}
              onChange={(e) => setNotaDia(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#1a1a1a',
                color: '#ccc',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '0.95rem',
                resize: 'vertical',
                lineHeight: '1.6',
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
              <button
                onClick={salvarNota}
                disabled={salvando || !notaDia.trim()}
                style={{
                  backgroundColor: (salvando || !notaDia.trim()) ? '#333' : '#e60000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  cursor: (salvando || !notaDia.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (salvando || !notaDia.trim()) ? 0.5 : 1,
                }}
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              {statusMsg && (
                <span style={{
                  color: statusMsg === 'Erro' ? '#ff4444' : '#4caf50',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                }}>
                  {statusMsg}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ======= WEEKLY REVIEW ======= */}
        {!loading && modo === 'semanal' && (
          <div>
            {/* Stats consolidados */}
            <div style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
                Resumo da Semana
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                  <div style={{ color: '#e60000', fontSize: '2rem', fontWeight: 'bold' }}>
                    {statsSemanais.taxaConclusao}%
                  </div>
                  <div style={{ color: '#666', fontSize: '0.75rem' }}>Taxa Geral</div>
                </div>
                <div style={{ width: '1px', backgroundColor: '#333' }} />
                <div>
                  <div style={{ color: '#4caf50', fontSize: '2rem', fontWeight: 'bold' }}>
                    {statsSemanais.totalConclusoes}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.75rem' }}>Conclusoes</div>
                </div>
                <div style={{ width: '1px', backgroundColor: '#333' }} />
                <div>
                  <div style={{ color: '#ff9800', fontSize: '2rem', fontWeight: 'bold' }}>
                    {statsSemanais.melhorDia}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.75rem' }}>Melhor Dia</div>
                </div>
              </div>
            </div>

            {/* Detalhamento por habito */}
            {dadosSemana?.habitos && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ color: '#888', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
                  Por Habito
                </h4>
                {dadosSemana.habitos.map((h) => {
                  const feitos = h.progresso ? h.progresso.filter(Boolean).length : 0;
                  const total = (dadosSemana.datas || []).length;
                  const pct = total > 0 ? Math.round((feitos / total) * 100) : 0;
                  return (
                    <div
                      key={h.habitoId}
                      style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        marginBottom: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ color: '#ccc', fontSize: '0.85rem' }}>{h.nome}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '60px',
                          height: '6px',
                          backgroundColor: '#222',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor: pct >= 80 ? '#4caf50' : pct >= 50 ? '#ff9800' : '#e60000',
                            borderRadius: '3px',
                          }} />
                        </div>
                        <span style={{
                          color: pct >= 80 ? '#4caf50' : pct >= 50 ? '#ff9800' : '#e60000',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          minWidth: '35px',
                          textAlign: 'right',
                        }}>
                          {feitos}/{total}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Campo de planejamento */}
            <label style={{ color: '#888', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
              Planejamento do proximo campo de batalha:
            </label>
            <textarea
              rows={6}
              placeholder="O que vai mudar na proxima semana? Quais batalhas precisa vencer?"
              value={notaSemana}
              onChange={(e) => setNotaSemana(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#1a1a1a',
                color: '#ccc',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '0.95rem',
                resize: 'vertical',
                lineHeight: '1.6',
                outline: 'none',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Revisao;
