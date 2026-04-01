import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CELL_SIZE = 13;
const CELL_GAP = 3;
const TOTAL = CELL_SIZE + CELL_GAP;
const WEEKS = 52;
const DAYS_LABELS = ['', 'Seg', '', 'Qua', '', 'Sex', ''];
const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getColor(count) {
  if (count === 0) return '#1a1a1a';
  if (count === 1) return '#5c1010';
  if (count === 2) return '#8b1a1a';
  if (count <= 4) return '#c62828';
  return '#e60000';
}

function toUTCKey(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildGrid(heatmapData) {
  const map = {};
  for (const entry of heatmapData) {
    map[entry.data] = entry.count;
  }

  const agora = new Date();
  const hoje = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()));
  const dias = WEEKS * 7;

  // Encontrar o domingo que inicia o grid (UTC)
  const inicio = new Date(hoje);
  inicio.setUTCDate(inicio.getUTCDate() - dias + 1);
  inicio.setUTCDate(inicio.getUTCDate() - inicio.getUTCDay());

  const grid = [];
  for (let i = 0; i < WEEKS; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      const d = new Date(inicio);
      d.setUTCDate(d.getUTCDate() + (i * 7 + j));
      const key = toUTCKey(d);
      const futuro = d > hoje;
      week.push({
        date: key,
        count: futuro ? -1 : (map[key] || 0),
      });
    }
    grid.push(week);
  }

  return grid;
}

function getMonthPositions(grid) {
  const positions = [];
  let lastMonth = -1;
  for (let w = 0; w < grid.length; w++) {
    const d = new Date(grid[w][0].date);
    const m = d.getMonth();
    if (m !== lastMonth) {
      positions.push({ month: m, x: w * TOTAL });
      lastMonth = m;
    }
  }
  return positions;
}

function Heatmap() {
  const [grid, setGrid] = useState([]);
  const [totalConclusoes, setTotalConclusoes] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/registro/heatmap?meses=12');
        const data = res.data;
        setGrid(buildGrid(data));
        setTotalConclusoes(data.reduce((sum, d) => sum + d.count, 0));
      } catch {
        setGrid(buildGrid([]));
      }
    };
    fetch();
  }, []);

  if (grid.length === 0) return null;

  const monthPositions = getMonthPositions(grid);
  const svgWidth = WEEKS * TOTAL + 30;
  const svgHeight = 7 * TOTAL + 30;

  return (
    <div style={{ marginTop: '24px', marginBottom: '24px' }}>
      <div className="d-flex justify-content-between align-items-center mb-2 px-1">
        <span style={{ color: '#999', fontSize: '0.85rem' }}>
          {totalConclusoes} conclusões no último ano
        </span>
        <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.75rem', color: '#666' }}>
          <span>Menos</span>
          {[0, 1, 2, 3, 5].map((c, i) => (
            <div
              key={i}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: getColor(c),
                borderRadius: '2px',
                border: '1px solid #222',
              }}
            />
          ))}
          <span>Mais</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        <svg width={svgWidth} height={svgHeight} style={{ display: 'block' }}>
          {/* Month labels */}
          {monthPositions.map((mp, i) => (
            <text
              key={i}
              x={mp.x + 30}
              y={10}
              fill="#666"
              fontSize="10"
            >
              {MONTH_LABELS[mp.month]}
            </text>
          ))}

          {/* Day labels */}
          {DAYS_LABELS.map((label, i) => (
            label && (
              <text
                key={i}
                x={0}
                y={18 + i * TOTAL + CELL_SIZE}
                fill="#666"
                fontSize="9"
              >
                {label}
              </text>
            )
          ))}

          {/* Cells */}
          {grid.map((week, wi) =>
            week.map((day, di) => (
              <rect
                key={`${wi}-${di}`}
                x={wi * TOTAL + 30}
                y={di * TOTAL + 16}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx="2"
                fill={day.count < 0 ? '#0d0d0d' : getColor(day.count)}
                stroke="#222"
                strokeWidth="1"
              >
                <title>{day.date}: {day.count < 0 ? '-' : day.count} conclusões</title>
              </rect>
            ))
          )}
        </svg>
      </div>
    </div>
  );
}

export default Heatmap;
