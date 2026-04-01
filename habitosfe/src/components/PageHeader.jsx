import React from 'react';
import { Link } from 'react-router-dom';

function PageHeader({ titulo }) {
  return (
    <header style={{
      backgroundColor: '#0a0a0a',
      borderBottom: '1px solid #222',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/habitos" style={{ textDecoration: 'none' }}>
        <span style={{ color: '#e60000', fontWeight: 'bold', fontSize: '1.1rem' }}>FireHabits</span>
      </Link>
      {titulo && (
        <span style={{ color: '#888', fontSize: '0.85rem', fontWeight: 'bold' }}>{titulo}</span>
      )}
    </header>
  );
}

export default PageHeader;
