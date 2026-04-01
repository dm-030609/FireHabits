import React from "react";

/*
  Tiers de evolução da chama:
  1-2   → Faísca       – pequena, cor escura, sem glow
  3-6   → Chama jovem  – média, laranja, brilho sutil
  7-13  → Chama forte  – grande, vermelho vivo, glow
  14-29 → Chama intensa – maior, núcleo amarelo, glow forte
  30+   → Inferno       – máxima, núcleo branco, pulso animado
*/

function getTier(streak) {
  if (streak >= 30) return 4;
  if (streak >= 14) return 3;
  if (streak >= 7) return 2;
  if (streak >= 3) return 1;
  return 0;
}

const tiers = [
  // tier 0: faísca (1-2 dias)
  {
    size: 20,
    colors: ['#8b2500', '#cc3300', '#993300'],
    glowColor: 'rgba(204, 51, 0, 0.15)',
    glowSize: 0,
    animate: false,
  },
  // tier 1: chama jovem (3-6 dias)
  {
    size: 24,
    colors: ['#cc3300', '#e65c00', '#ff6600'],
    glowColor: 'rgba(230, 92, 0, 0.2)',
    glowSize: 4,
    animate: false,
  },
  // tier 2: chama forte (7-13 dias)
  {
    size: 28,
    colors: ['#cc0000', '#e60000', '#ff3300'],
    glowColor: 'rgba(230, 0, 0, 0.3)',
    glowSize: 8,
    animate: false,
  },
  // tier 3: chama intensa (14-29 dias)
  {
    size: 32,
    colors: ['#cc0000', '#ff2200', '#ff6600', '#ffaa00'],
    glowColor: 'rgba(255, 34, 0, 0.35)',
    glowSize: 12,
    animate: true,
  },
  // tier 4: inferno (30+ dias)
  {
    size: 36,
    colors: ['#cc0000', '#ff0000', '#ff6600', '#ffcc00', '#fff5e6'],
    glowColor: 'rgba(255, 100, 0, 0.4)',
    glowSize: 16,
    animate: true,
  },
];

function StreakFlame({ streak }) {
  if (!streak || streak <= 0) return null;

  const tier = getTier(streak);
  const t = tiers[tier];
  const id = `flame-grad-${streak}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: '#1a0a0a',
      padding: '4px 10px 4px 6px',
      borderRadius: '14px',
      border: `1px solid ${tier >= 3 ? '#3a1a00' : '#2a1010'}`,
      whiteSpace: 'nowrap',
    }}>
      <div style={{
        position: 'relative',
        width: t.size,
        height: t.size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Glow */}
        {t.glowSize > 0 && (
          <div style={{
            position: 'absolute',
            inset: -t.glowSize / 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${t.glowColor} 0%, transparent 70%)`,
            animation: t.animate ? 'flamePulse 2s ease-in-out infinite' : 'none',
          }} />
        )}

        <svg
          width={t.size}
          height={t.size}
          viewBox="0 0 24 24"
          fill="none"
          style={{
            position: 'relative',
            zIndex: 1,
            filter: tier >= 2 ? `drop-shadow(0 0 ${tier}px ${t.colors[1]})` : 'none',
            animation: t.animate ? 'flameFlicker 3s ease-in-out infinite' : 'none',
          }}
        >
          <defs>
            <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
              {t.colors.map((color, i) => (
                <stop
                  key={i}
                  offset={`${(i / (t.colors.length - 1)) * 100}%`}
                  stopColor={color}
                />
              ))}
            </linearGradient>
          </defs>
          {/* Chama principal */}
          <path
            d="M12 2C12 2 7.5 8 7.5 12.5C7.5 15.5 9.5 18 12 19.5C14.5 18 16.5 15.5 16.5 12.5C16.5 8 12 2 12 2Z"
            fill={`url(#${id})`}
          />
          {/* Chama interior (aparece tier >= 2) */}
          {tier >= 2 && (
            <path
              d="M12 7C12 7 9.8 10.5 9.8 13C9.8 14.8 10.8 16.2 12 17C13.2 16.2 14.2 14.8 14.2 13C14.2 10.5 12 7 12 7Z"
              fill={t.colors[t.colors.length - 1]}
              opacity={tier >= 4 ? 0.9 : tier >= 3 ? 0.7 : 0.4}
            />
          )}
          {/* Núcleo brilhante (tier >= 4) */}
          {tier >= 4 && (
            <ellipse
              cx="12"
              cy="14.5"
              rx="1.5"
              ry="2.5"
              fill="#fff5e6"
              opacity="0.6"
            />
          )}
        </svg>
      </div>

      <span style={{
        color: tier >= 3 ? '#ffaa00' : tier >= 2 ? '#ff4400' : tier >= 1 ? '#e65c00' : '#cc3300',
        fontWeight: 'bold',
        fontSize: tier >= 3 ? '0.85rem' : '0.8rem',
        letterSpacing: '0.3px',
      }}>
        {streak}
      </span>

      <style>{`
        @keyframes flamePulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes flameFlicker {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          25% { transform: scaleY(1.04) scaleX(0.97); }
          50% { transform: scaleY(0.97) scaleX(1.02); }
          75% { transform: scaleY(1.03) scaleX(0.98); }
        }
      `}</style>
    </div>
  );
}

export default StreakFlame;
