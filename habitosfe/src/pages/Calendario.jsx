import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PageHeader from '../components/PageHeader.jsx';

// ---- Constants ----
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MESES_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const CATEGORIAS = [
  { key: 'deep-work', label: 'Deep Work', cor: '#e60000' },
  { key: 'reuniao',   label: 'Reunião',   cor: '#ff9800' },
  { key: 'treino',    label: 'Treino',    cor: '#4caf50' },
  { key: 'rotina',    label: 'Rotina',    cor: '#2196f3' },
  { key: 'livre',     label: 'Livre',     cor: '#9c27b0' },
];

const START_HOUR = 5;
const END_HOUR   = 23;
const START_MIN  = START_HOUR * 60;
const END_MIN    = END_HOUR * 60;
const TOTAL_MIN  = END_MIN - START_MIN; // 1080
const PX_PER_MIN = 1.2; // 60 min = 72px, total timeline = 1296px

const HOUR_LABELS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

// ---- Utilities ----
function h2m(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}
function m2h(min) {
  const c = Math.max(START_MIN, Math.min(END_MIN, min));
  return `${String(Math.floor(c / 60)).padStart(2, '0')}:${String(c % 60).padStart(2, '0')}`;
}
function getWeekStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function calcNowPx() {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return Math.max(0, Math.min(TOTAL_MIN, nowMin - START_MIN)) * PX_PER_MIN;
}
function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}
function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function catCor(cat) {
  return CATEGORIAS.find(c => c.key === cat)?.cor || '#555';
}
function blocoPos(bloco) {
  const cor         = bloco.cor || catCor(bloco.categoria);
  const durationMin = h2m(bloco.horaFim) - h2m(bloco.horaInicio);
  const top         = (h2m(bloco.horaInicio) - START_MIN) * PX_PER_MIN;
  const height      = Math.max(22, durationMin * PX_PER_MIN);
  return { top, height, cor, durationMin };
}

/**
 * Retorna os blocos que pertencem a uma data específica:
 * - Avulso: dataEspecifica bate exatamente com `date`
 * - Recorrente: diaSemana bate com o dia-da-semana de `date`
 */
function blocosParaData(blocos, date) {
  const dateStr = formatDate(date); // "YYYY-MM-DD" local
  return blocos.filter(b => {
    if (b.dataEspecifica) {
      // Compara como string UTC para evitar offset de fuso horário
      // Ex: "2026-04-08T00:00:00.000Z".slice(0,10) === "2026-04-08"
      const storedStr = new Date(b.dataEspecifica).toISOString().slice(0, 10);
      return storedStr === dateStr;
    }
    return b.diaSemana === date.getDay();
  }).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
}

// ---- Shared styles ----
const NAV_BTN = {
  background: 'none', border: '1px solid #2a2a2a', color: '#666', borderRadius: '6px',
  width: '34px', height: '34px', cursor: 'pointer', fontSize: '1.3rem', lineHeight: 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};

// ============================================================
// CalendarHeader
// ============================================================
function CalendarHeader({ viewMode, setViewMode, currentDate, onNav, onHoje }) {
  const hoje = new Date();
  let label = '';
  if (viewMode === 'dia') {
    label = `${DIAS[currentDate.getDay()]}, ${currentDate.getDate()} ${MESES_FULL[currentDate.getMonth()]}`;
  } else if (viewMode === 'semana') {
    const ws = getWeekStart(currentDate);
    const we = addDays(ws, 6);
    if (ws.getMonth() === we.getMonth()) {
      label = `${ws.getDate()}–${we.getDate()} ${MESES_FULL[ws.getMonth()]} ${ws.getFullYear()}`;
    } else {
      label = `${ws.getDate()} ${MESES[ws.getMonth()]} – ${we.getDate()} ${MESES[we.getMonth()]} ${we.getFullYear()}`;
    }
  } else {
    label = `${MESES_FULL[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }

  const isHoje = isSameDay(currentDate, hoje);

  return (
    <div style={{ backgroundColor: '#111', borderBottom: '1px solid #1e1e1e', padding: '10px 16px', position: 'sticky', top: 0, zIndex: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
        {[['dia','Dia'], ['semana','Semana'], ['mes','Mês']].map(([m, lbl]) => (
          <button key={m} onClick={() => setViewMode(m)} style={{
            padding: '4px 16px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer',
            border: viewMode === m ? '1px solid #e60000' : '1px solid #2a2a2a',
            backgroundColor: viewMode === m ? '#e60000' : '#1a1a1a',
            color: '#fff',
          }}>{lbl}</button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <button onClick={() => onNav(-1)} style={NAV_BTN}>‹</button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>{label}</div>
          {!isHoje && (
            <button onClick={onHoje} style={{ background: 'none', border: 'none', color: '#e60000', fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}>
              ↩ Hoje
            </button>
          )}
        </div>
        <button onClick={() => onNav(1)} style={NAV_BTN}>›</button>
      </div>
    </div>
  );
}

// ============================================================
// MonthView
// ============================================================
function MonthView({ currentDate, blocos, onDayClick }) {
  const hoje  = new Date();
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth    = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ padding: '8px 10px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
        {DIAS.map(d => (
          <div key={d} style={{ textAlign: 'center', color: '#444', fontSize: '0.65rem', fontWeight: 'bold', padding: '4px 0' }}>
            {d.slice(0, 3)}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} style={{ minHeight: '52px' }} />;
          const cellDate  = new Date(year, month, day);
          const isToday   = isSameDay(cellDate, hoje);
          const dayBlocos = blocosParaData(blocos, cellDate);
          return (
            <div key={day} onClick={() => onDayClick(cellDate)} style={{
              minHeight: '52px', padding: '4px 2px', borderRadius: '6px',
              backgroundColor: '#1a1a1a', cursor: 'pointer',
              border: isToday ? '1px solid #e60000' : '1px solid #1e1e1e',
            }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 3px',
                backgroundColor: isToday ? '#e60000' : 'transparent',
                color: isToday ? '#fff' : '#bbb',
                fontSize: '0.78rem', fontWeight: isToday ? 'bold' : 'normal',
              }}>{day}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', justifyContent: 'center' }}>
                {dayBlocos.slice(0, 4).map(b => (
                  <div key={b._id} style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    backgroundColor: b.cor || catCor(b.categoria), flexShrink: 0,
                  }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// WeekView
// ============================================================
function WeekView({ currentDate, blocos, nowPx, onTimeClick, onBlocoClick }) {
  const hoje      = new Date();
  const weekStart = getWeekStart(currentDate);
  const days      = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ minWidth: '480px' }}>
        {/* Day headers */}
        <div style={{ display: 'flex', paddingLeft: '40px', borderBottom: '1px solid #1e1e1e', backgroundColor: '#111' }}>
          {days.map((day, i) => {
            const isToday = isSameDay(day, hoje);
            return (
              <div key={i} style={{ flex: 1, textAlign: 'center', padding: '6px 0' }}>
                <div style={{ color: '#555', fontSize: '0.6rem', fontWeight: 'bold' }}>{DIAS[day.getDay()]}</div>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%', margin: '2px auto 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isToday ? '#e60000' : 'transparent',
                  color: isToday ? '#fff' : '#ccc', fontWeight: 'bold', fontSize: '0.85rem',
                }}>{day.getDate()}</div>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div style={{ display: 'flex', overflowY: 'auto', maxHeight: 'calc(100vh - 240px)' }}>
          {/* Hour labels */}
          <div style={{ width: '40px', flexShrink: 0, position: 'relative', height: `${TOTAL_MIN * PX_PER_MIN}px` }}>
            {HOUR_LABELS.map((h, i) => (
              <div key={h} style={{
                position: 'absolute', top: `${i * 60 * PX_PER_MIN}px`,
                right: '4px', color: '#444', fontSize: '0.58rem', lineHeight: 1,
              }}>{String(h).padStart(2, '0')}:00</div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, colIdx) => {
            const dayBlocos = blocosParaData(blocos, day);
            const isToday   = isSameDay(day, hoje);

            const handleClick = (e) => {
              if (e.target !== e.currentTarget) return;
              const rect   = e.currentTarget.getBoundingClientRect();
              const rawMin = Math.round((( e.clientY - rect.top) / PX_PER_MIN + START_MIN) / 30) * 30;
              onTimeClick(day, m2h(rawMin), m2h(rawMin + 60));
            };

            return (
              <div key={colIdx} onClick={handleClick} style={{
                flex: 1, position: 'relative', height: `${TOTAL_MIN * PX_PER_MIN}px`,
                borderLeft: '1px solid #1e1e1e', cursor: 'crosshair',
              }}>
                {HOUR_LABELS.map((_, i) => (
                  <div key={i} style={{
                    position: 'absolute', top: `${i * 60 * PX_PER_MIN}px`,
                    left: 0, right: 0, borderTop: '1px solid #1a1a1a', pointerEvents: 'none',
                  }} />
                ))}
                {isToday && (
                  <div style={{
                    position: 'absolute', top: `${nowPx}px`, left: 0, right: 0,
                    borderTop: '2px solid #e60000', zIndex: 5, pointerEvents: 'none',
                  }}>
                    <div style={{ position: 'absolute', left: '-4px', top: '-4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e60000' }} />
                  </div>
                )}
                {dayBlocos.map(bloco => {
                  const { top, height, cor, durationMin } = blocoPos(bloco);
                  const isAvulso = !!bloco.dataEspecifica;
                  const isShort  = durationMin < 45;
                  return (
                    <div key={bloco._id} onClick={(e) => { e.stopPropagation(); onBlocoClick(bloco); }} style={{
                      position: 'absolute', top: `${top}px`, height: `${height}px`,
                      left: '2px', right: '2px', borderRadius: '4px',
                      backgroundColor: cor + '22', borderLeft: `3px solid ${cor}`,
                      padding: '2px 4px', overflow: 'hidden', cursor: 'pointer', zIndex: 2,
                      display: 'flex', flexDirection: 'column', justifyContent: 'center',
                      boxSizing: 'border-box',
                    }}>
                      <div style={{
                        color: '#fff', fontSize: '0.62rem', fontWeight: 'bold',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{bloco.titulo}</div>
                      {!isShort && (
                        <div style={{ color: '#777', fontSize: '0.55rem', whiteSpace: 'nowrap' }}>{bloco.horaInicio}</div>
                      )}
                      {isAvulso && (
                        <div style={{ position: 'absolute', top: '2px', right: '2px', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#ff9800' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DayView
// ============================================================
function DayView({ currentDate, blocos, nowPx, onTimeClick, onBlocoClick }) {
  const hoje      = new Date();
  const isToday   = isSameDay(currentDate, hoje);
  const dayBlocos = blocosParaData(blocos, currentDate);

  const handleTimelineClick = (e) => {
    if (e.target !== e.currentTarget) return;
    const rect   = e.currentTarget.getBoundingClientRect();
    const rawMin = Math.round((( e.clientY - rect.top) / PX_PER_MIN + START_MIN) / 30) * 30;
    onTimeClick(currentDate, m2h(rawMin), m2h(rawMin + 60));
  };

  return (
    <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
      <div style={{ display: 'flex' }}>
        {/* Hour labels */}
        <div style={{ width: '46px', flexShrink: 0, position: 'relative', height: `${TOTAL_MIN * PX_PER_MIN}px` }}>
          {HOUR_LABELS.map((h, i) => (
            <div key={h} style={{
              position: 'absolute', top: `${i * 60 * PX_PER_MIN - 7}px`,
              right: '6px', color: '#444', fontSize: '0.62rem', textAlign: 'right',
            }}>{String(h).padStart(2, '0')}:00</div>
          ))}
        </div>

        {/* Timeline */}
        <div onClick={handleTimelineClick} style={{
          flex: 1, position: 'relative', height: `${TOTAL_MIN * PX_PER_MIN}px`,
          borderLeft: '1px solid #2a2a2a', cursor: 'crosshair',
        }}>
          {HOUR_LABELS.map((_, i) => (
            <div key={i} style={{ position: 'absolute', top: `${i * 60 * PX_PER_MIN}px`, left: 0, right: 0, borderTop: '1px solid #1a1a1a', pointerEvents: 'none' }} />
          ))}
          {HOUR_LABELS.map((_, i) => (
            <div key={`hh${i}`} style={{ position: 'absolute', top: `${i * 60 * PX_PER_MIN + 30}px`, left: 0, right: 0, borderTop: '1px dashed #161616', pointerEvents: 'none' }} />
          ))}

          {/* Now line */}
          {isToday && (
            <div style={{ position: 'absolute', top: `${nowPx}px`, left: '-4px', right: 0, borderTop: '2px solid #e60000', zIndex: 5, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', left: '-3px', top: '-4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e60000' }} />
            </div>
          )}

          {dayBlocos.length === 0 && (
            <div style={{ position: 'absolute', top: '40%', left: 0, right: 0, textAlign: 'center', color: '#2a2a2a', fontSize: '0.8rem', pointerEvents: 'none' }}>
              <div>Nenhum bloco agendado.</div>
              <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>Toque na linha do tempo para criar.</div>
            </div>
          )}

          {dayBlocos.map(bloco => {
            const { top, height, cor, durationMin } = blocoPos(bloco);
            const isAvulso  = !!bloco.dataEspecifica;
            const isShort   = durationMin < 45;   // < 45 min: compacto
            const isMedium  = durationMin < 60;   // 45-59 min: sem tag separada
            const padding   = isShort ? '3px 8px' : '6px 10px';

            const tagEl = (
              <span style={{
                flexShrink: 0,
                backgroundColor: cor + '28', color: cor,
                fontSize: '0.58rem', fontWeight: 'bold',
                padding: '1px 6px', borderRadius: '3px',
                whiteSpace: 'nowrap',
              }}>{bloco.categoria}</span>
            );

            return (
              <div key={bloco._id} onClick={(e) => { e.stopPropagation(); onBlocoClick(bloco); }} style={{
                position: 'absolute', top: `${top}px`, height: `${height}px`,
                left: '4px', right: '10px', borderRadius: '6px',
                backgroundColor: cor + '1a', borderLeft: `4px solid ${cor}`,
                padding, overflow: 'hidden', cursor: 'pointer', zIndex: 2,
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                boxSizing: 'border-box',
              }}>
                {/* Linha do título */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                  <span style={{
                    color: '#fff', fontSize: isShort ? '0.78rem' : '0.88rem', fontWeight: 'bold',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    flex: 1, minWidth: 0,
                  }}>{bloco.titulo}</span>
                  {/* Tag e badge avulso inline quando bloco é curto */}
                  {isShort && tagEl}
                  {isAvulso && (
                    <span style={{ flexShrink: 0, fontSize: '0.55rem', color: '#ff9800', backgroundColor: '#ff980020', padding: '1px 4px', borderRadius: '3px' }}>avulso</span>
                  )}
                </div>

                {/* Horário: só aparece se ≥ 45 min */}
                {!isShort && (
                  <div style={{ color: '#666', fontSize: '0.72rem', marginTop: '2px', whiteSpace: 'nowrap' }}>
                    {bloco.horaInicio} — {bloco.horaFim}
                  </div>
                )}

                {/* Tag separada: só aparece se ≥ 60 min */}
                {!isMedium && (
                  <div style={{ marginTop: '4px' }}>{tagEl}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// BlocoModal
// ============================================================
function BlocoModal({
  show, editandoId, onClose, onSave, onDelete,
  formTipo, setFormTipo,
  formTitulo, setFormTitulo,
  formDia, setFormDia,
  formDataEsp, setFormDataEsp,
  formInicio, setFormInicio,
  formFim, setFormFim,
  formCategoria, setFormCategoria,
}) {
  if (!show) return null;

  const inputStyle = {
    width: '100%', backgroundColor: '#111', color: '#ccc',
    border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 12px',
    fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = { color: '#555', fontSize: '0.68rem', fontWeight: 'bold', display: 'block', marginBottom: '5px', letterSpacing: '0.05em' };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.78)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      <div style={{ backgroundColor: '#1a1a1a', borderRadius: '12px', border: '1px solid #2a2a2a', width: '100%', maxWidth: '400px', padding: '20px' }}>
        <h3 style={{ color: '#e60000', fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>
          {editandoId ? 'Editar Bloco' : 'Novo Bloco'}
        </h3>

        {/* Tipo: Avulso / Recorrente */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
          {[['avulso','📅 Avulso'], ['recorrente','🔁 Recorrente']].map(([t, lbl]) => (
            <button key={t} onClick={() => setFormTipo(t)} style={{
              flex: 1, padding: '7px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer',
              border: formTipo === t ? '1px solid #e60000' : '1px solid #2a2a2a',
              backgroundColor: formTipo === t ? '#e6000015' : '#111',
              color: formTipo === t ? '#e60000' : '#555',
            }}>{lbl}</button>
          ))}
        </div>

        {/* Título */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>TÍTULO</label>
          <input type="text" placeholder="Ex: Deep Work — Projeto X" value={formTitulo}
            onChange={(e) => setFormTitulo(e.target.value)} autoFocus style={inputStyle} />
        </div>

        {/* Data específica (avulso) */}
        {formTipo === 'avulso' && (
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>DATA</label>
            <input type="date" value={formDataEsp} onChange={(e) => setFormDataEsp(e.target.value)}
              style={{ ...inputStyle, colorScheme: 'dark' }} />
          </div>
        )}

        {/* Dia da semana (recorrente) */}
        {formTipo === 'recorrente' && (
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>DIA DA SEMANA</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {DIAS.map((d, i) => (
                <button key={i} onClick={() => setFormDia(i)} style={{
                  flex: 1, padding: '7px 2px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 'bold', cursor: 'pointer',
                  border: formDia === i ? '1px solid #e60000' : '1px solid #2a2a2a',
                  backgroundColor: formDia === i ? '#e60000' : '#111', color: '#fff',
                }}>{d.slice(0, 3)}</button>
              ))}
            </div>
          </div>
        )}

        {/* Horários */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>INÍCIO</label>
            <input type="time" value={formInicio} onChange={(e) => setFormInicio(e.target.value)}
              style={{ ...inputStyle, colorScheme: 'dark' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>FIM</label>
            <input type="time" value={formFim} onChange={(e) => setFormFim(e.target.value)}
              style={{ ...inputStyle, colorScheme: 'dark' }} />
          </div>
        </div>

        {/* Categoria */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>CATEGORIA</label>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {CATEGORIAS.map(cat => (
              <button key={cat.key} onClick={() => setFormCategoria(cat.key)} style={{
                padding: '5px 10px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 'bold', cursor: 'pointer',
                border: formCategoria === cat.key ? `2px solid ${cat.cor}` : '1px solid #2a2a2a',
                backgroundColor: formCategoria === cat.key ? cat.cor + '22' : 'transparent',
                color: formCategoria === cat.key ? cat.cor : '#444',
              }}>{cat.label}</button>
            ))}
          </div>
        </div>

        {editandoId && (
          <button onClick={onDelete} style={{
            width: '100%', backgroundColor: 'transparent', color: '#555',
            border: '1px solid #2a2a2a', borderRadius: '8px', padding: '8px',
            fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer', marginBottom: '8px',
          }}>Excluir Bloco</button>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onClose} style={{
            flex: 1, backgroundColor: '#1e1e1e', color: '#666', border: '1px solid #2a2a2a',
            borderRadius: '8px', padding: '10px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer',
          }}>Cancelar</button>
          <button onClick={onSave} disabled={!formTitulo.trim()} style={{
            flex: 1, backgroundColor: formTitulo.trim() ? '#e60000' : '#2a2a2a', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '10px', fontWeight: 'bold', fontSize: '0.9rem',
            cursor: formTitulo.trim() ? 'pointer' : 'not-allowed', opacity: formTitulo.trim() ? 1 : 0.5,
          }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Calendario
// ============================================================
function Calendario() {
  const [viewMode,    setViewMode]    = useState('dia');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [blocos,      setBlocos]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [nowPx,       setNowPx]       = useState(calcNowPx());

  // Form state
  const [showForm,      setShowForm]      = useState(false);
  const [editandoId,    setEditandoId]    = useState(null);
  const [formTipo,      setFormTipo]      = useState('avulso');      // 'avulso' | 'recorrente'
  const [formTitulo,    setFormTitulo]    = useState('');
  const [formDia,       setFormDia]       = useState(new Date().getDay());
  const [formDataEsp,   setFormDataEsp]   = useState(formatDate(new Date())); // "YYYY-MM-DD"
  const [formInicio,    setFormInicio]    = useState('08:00');
  const [formFim,       setFormFim]       = useState('09:00');
  const [formCategoria, setFormCategoria] = useState('deep-work');

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

  useEffect(() => {
    const id = setInterval(() => setNowPx(calcNowPx()), 60000);
    return () => clearInterval(id);
  }, []);

  const navegar = (dir) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (viewMode === 'dia')         d.setDate(d.getDate() + dir);
      else if (viewMode === 'semana') d.setDate(d.getDate() + dir * 7);
      else                            d.setMonth(d.getMonth() + dir);
      return d;
    });
  };

  /**
   * Abre o formulário.
   * @param {object|null} bloco   - bloco existente (edição) ou null (criação)
   * @param {Date|null}   date    - data clicada na timeline (para pré-preencher)
   * @param {string}      inicio  - horário de início pré-selecionado
   * @param {string}      fim     - horário de fim pré-selecionado
   */
  const abrirForm = (bloco, date, inicio, fim) => {
    if (bloco) {
      // Edição: detecta tipo pelo que tem no bloco
      const isAvulso = !!bloco.dataEspecifica;
      setFormTipo(isAvulso ? 'avulso' : 'recorrente');
      setFormTitulo(bloco.titulo);
      setFormDia(bloco.diaSemana ?? new Date().getDay());
      setFormDataEsp(isAvulso ? formatDate(new Date(bloco.dataEspecifica)) : formatDate(new Date()));
      setFormInicio(bloco.horaInicio);
      setFormFim(bloco.horaFim);
      setFormCategoria(bloco.categoria);
      setEditandoId(bloco._id);
    } else {
      // Criação: usa a data clicada (ou hoje) → padrão avulso
      const ref = date ?? currentDate;
      setFormTipo('avulso');
      setFormTitulo('');
      setFormDia(ref.getDay());
      setFormDataEsp(formatDate(ref));
      setFormInicio(inicio ?? '08:00');
      setFormFim(fim ?? '09:00');
      setFormCategoria('deep-work');
      setEditandoId(null);
    }
    setShowForm(true);
  };

  const salvarBloco = async () => {
    if (!formTitulo.trim()) return;
    const dados = {
      titulo:    formTitulo,
      horaInicio: formInicio,
      horaFim:   formFim,
      categoria: formCategoria,
      cor: CATEGORIAS.find(c => c.key === formCategoria)?.cor || '#e60000',
      // tipo avulso: envia data; recorrente: envia diaSemana
      ...(formTipo === 'avulso'
        ? { dataEspecifica: formDataEsp, diaSemana: null }
        : { diaSemana: formDia, dataEspecifica: null }
      ),
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
    setShowForm(false);
  };

  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh', paddingBottom: '80px' }}>
      <PageHeader titulo="Calendário" />

      <CalendarHeader
        viewMode={viewMode} setViewMode={setViewMode}
        currentDate={currentDate}
        onNav={navegar}
        onHoje={() => setCurrentDate(new Date())}
      />

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#333' }}>Carregando...</div>
      )}

      {!loading && viewMode === 'mes' && (
        <MonthView
          currentDate={currentDate} blocos={blocos}
          onDayClick={(date) => { setCurrentDate(date); setViewMode('dia'); }}
        />
      )}
      {!loading && viewMode === 'semana' && (
        <WeekView
          currentDate={currentDate} blocos={blocos} nowPx={nowPx}
          onTimeClick={(date, inicio, fim) => abrirForm(null, date, inicio, fim)}
          onBlocoClick={(bloco) => abrirForm(bloco)}
        />
      )}
      {!loading && viewMode === 'dia' && (
        <DayView
          currentDate={currentDate} blocos={blocos} nowPx={nowPx}
          onTimeClick={(date, inicio, fim) => abrirForm(null, date, inicio, fim)}
          onBlocoClick={(bloco) => abrirForm(bloco)}
        />
      )}

      {/* FAB */}
      {!showForm && (
        <button onClick={() => abrirForm(null)} style={{
          position: 'fixed', bottom: '80px', right: '20px',
          width: '56px', height: '56px', backgroundColor: '#e60000',
          borderRadius: '14px', boxShadow: '0 4px 20px rgba(230,0,0,0.4)',
          zIndex: 998, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer',
        }}>+</button>
      )}

      <BlocoModal
        show={showForm} editandoId={editandoId}
        onClose={() => setShowForm(false)} onSave={salvarBloco}
        onDelete={() => excluirBloco(editandoId)}
        formTipo={formTipo}           setFormTipo={setFormTipo}
        formTitulo={formTitulo}       setFormTitulo={setFormTitulo}
        formDia={formDia}             setFormDia={setFormDia}
        formDataEsp={formDataEsp}     setFormDataEsp={setFormDataEsp}
        formInicio={formInicio}       setFormInicio={setFormInicio}
        formFim={formFim}             setFormFim={setFormFim}
        formCategoria={formCategoria} setFormCategoria={setFormCategoria}
      />
    </div>
  );
}

export default Calendario;
