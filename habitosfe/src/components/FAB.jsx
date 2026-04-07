import React from 'react';
import { Link } from 'react-router-dom';

function FAB({ to, label = '+' }) {
  return (
    <Link
      to={to}
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        width: '56px',
        height: '56px',
        backgroundColor: '#e60000',
        borderRadius: '14px',
        boxShadow: '0 4px 20px rgba(230, 0, 0, 0.4)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        textDecoration: 'none',
        color: '#fff',
        fontWeight: 'bold',
      }}
    >
      {label}
    </Link>
  );
}

export default FAB;
