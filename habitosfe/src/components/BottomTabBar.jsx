import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Flame,
  ListChecks,
  Timer,
  BarChart3,
  MoreHorizontal,
  CalendarDays,
  BookOpen,
  X,
} from 'lucide-react';

const mainTabs = [
  { path: '/habitos', label: 'Habitos', Icon: Flame },
  { path: '/tarefas', label: 'Tarefas', Icon: ListChecks },
  { path: '/pomodoro', label: 'Foco', Icon: Timer },
  { path: '/dashboard', label: 'Stats', Icon: BarChart3 },
];

const moreTabs = [
  { path: '/calendario', label: 'Calendario', Icon: CalendarDays },
  { path: '/revisao', label: 'Revisao', Icon: BookOpen },
  { path: '/diario', label: 'Diario', Icon: BookOpen },
];

function BottomTabBar() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const currentPath = location.pathname;

  const isMoreActive = moreTabs.some(t => currentPath === t.path);

  return (
    <>
      {/* Overlay do menu "mais" */}
      {moreOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 998,
          }}
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* Menu expandido */}
      {moreOpen && (
        <div style={{
          position: 'fixed',
          bottom: '64px',
          right: '12px',
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '8px 0',
          zIndex: 999,
          minWidth: '180px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
        }}>
          {moreTabs.map(({ path, label, Icon }) => {
            const ativo = currentPath === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMoreOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  textDecoration: 'none',
                  color: ativo ? '#e60000' : '#aaa',
                  fontSize: '0.9rem',
                  fontWeight: ativo ? 'bold' : 'normal',
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Bottom bar */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: '#0a0a0a',
        borderTop: '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 999,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {mainTabs.map(({ path, label, Icon }) => {
          const ativo = currentPath === path;
          return (
            <Link
              key={path}
              to={path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                textDecoration: 'none',
                color: ativo ? '#e60000' : '#555',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                padding: '6px 0',
                flex: 1,
              }}
            >
              <Icon size={20} strokeWidth={ativo ? 2.5 : 1.5} />
              {label}
            </Link>
          );
        })}

        {/* Botao Mais */}
        <button
          onClick={() => setMoreOpen(prev => !prev)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            background: 'none',
            border: 'none',
            color: moreOpen || isMoreActive ? '#e60000' : '#555',
            fontSize: '0.65rem',
            fontWeight: 'bold',
            padding: '6px 0',
            cursor: 'pointer',
            flex: 1,
          }}
        >
          {moreOpen ? <X size={20} strokeWidth={2.5} /> : <MoreHorizontal size={20} strokeWidth={isMoreActive ? 2.5 : 1.5} />}
          Mais
        </button>
      </nav>
    </>
  );
}

export default BottomTabBar;
