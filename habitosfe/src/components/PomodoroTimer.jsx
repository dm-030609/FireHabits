import React, { useState, useEffect, useRef, useCallback } from 'react';

const FOCO_SEG = 25 * 60;
const PAUSA_SEG = 5 * 60;

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function PomodoroTimer({ onSessaoCompleta }) {
  const [modo, setModo] = useState('foco'); // 'foco' | 'pausa'
  const [tempoRestante, setTempoRestante] = useState(FOCO_SEG);
  const [rodando, setRodando] = useState(false);
  const [sessoes, setSessoes] = useState(0);
  const intervalRef = useRef(null);

  const limparInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!rodando) {
      limparInterval();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTempoRestante(prev => {
        if (prev <= 1) {
          limparInterval();
          setRodando(false);

          if (modo === 'foco') {
            const novasSessoes = sessoes + 1;
            setSessoes(novasSessoes);
            if (onSessaoCompleta) onSessaoCompleta(novasSessoes);

            // Notificar
            try {
              if (Notification.permission === 'granted') {
                new Notification('Foco concluido!', { body: 'Hora de uma pausa de 5 min.' });
              }
            } catch { /* silent */ }

            // Auto-switch para pausa
            setModo('pausa');
            return PAUSA_SEG;
          } else {
            try {
              if (Notification.permission === 'granted') {
                new Notification('Pausa acabou!', { body: 'De volta ao campo de batalha.' });
              }
            } catch { /* silent */ }

            setModo('foco');
            return FOCO_SEG;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return limparInterval;
  }, [rodando, modo, sessoes, limparInterval, onSessaoCompleta]);

  const toggleRodando = () => setRodando(prev => !prev);

  const resetar = () => {
    limparInterval();
    setRodando(false);
    setModo('foco');
    setTempoRestante(FOCO_SEG);
  };

  const trocarModo = (novoModo) => {
    limparInterval();
    setRodando(false);
    setModo(novoModo);
    setTempoRestante(novoModo === 'foco' ? FOCO_SEG : PAUSA_SEG);
  };

  const isFoco = modo === 'foco';
  const accentColor = isFoco ? '#e60000' : '#4caf50';

  // Progresso circular
  const totalSeg = isFoco ? FOCO_SEG : PAUSA_SEG;
  const progresso = 1 - (tempoRestante / totalSeg);
  const raio = 110;
  const circunferencia = 2 * Math.PI * raio;
  const offset = circunferencia * (1 - progresso);

  return (
    <div style={{ textAlign: 'center' }}>

      {/* Toggle Foco / Pausa */}
      <div style={{
        display: 'flex',
        gap: '4px',
        justifyContent: 'center',
        marginBottom: '24px',
        backgroundColor: '#0a0a0a',
        borderRadius: '10px',
        padding: '4px',
        maxWidth: '240px',
        margin: '0 auto 24px',
      }}>
        {[
          { key: 'foco', label: 'Foco', color: '#e60000' },
          { key: 'pausa', label: 'Pausa', color: '#4caf50' },
        ].map((tab) => {
          const ativo = modo === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => trocarModo(tab.key)}
              style={{
                flex: 1,
                padding: '8px',
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

      {/* Timer circular */}
      <div style={{ position: 'relative', width: '260px', height: '260px', margin: '0 auto 24px' }}>
        <svg width="260" height="260" viewBox="0 0 260 260">
          {/* Track */}
          <circle cx="130" cy="130" r={raio} fill="none" stroke="#1a1a1a" strokeWidth="8" />
          {/* Progresso */}
          <circle
            cx="130" cy="130" r={raio}
            fill="none"
            stroke={accentColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={offset}
            transform="rotate(-90 130 130)"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            color: '#fff',
            fontSize: '3.5rem',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            letterSpacing: '2px',
          }}>
            {formatTime(tempoRestante)}
          </span>
          <span style={{ color: '#555', fontSize: '0.8rem', marginTop: '4px' }}>
            {isFoco ? 'FOCO' : 'PAUSA'}
          </span>
        </div>
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
        <button
          onClick={resetar}
          style={{
            backgroundColor: '#1a1a1a',
            color: '#888',
            border: '1px solid #333',
            borderRadius: '10px',
            padding: '12px 24px',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Resetar
        </button>
        <button
          onClick={toggleRodando}
          style={{
            backgroundColor: accentColor,
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 32px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: rodando ? 'none' : `0 4px 20px ${accentColor}40`,
          }}
        >
          {rodando ? 'Pausar' : 'Iniciar'}
        </button>
      </div>

      {/* Contador de sessoes */}
      <div style={{ color: '#555', fontSize: '0.85rem' }}>
        <span style={{ color: '#e60000', fontWeight: 'bold', fontSize: '1.1rem' }}>{sessoes}</span>
        {sessoes === 1 ? ' sessão' : ' sessões'} hoje
      </div>
    </div>
  );
}

export default PomodoroTimer;
