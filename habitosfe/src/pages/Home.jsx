import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#111',
      color: '#fff',
      textAlign: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '16px',
        backgroundColor: '#1a1a1a',
        border: '2px solid #e60000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        marginBottom: '20px',
        boxShadow: '0 0 30px rgba(230, 0, 0, 0.3)',
      }}>
        🔥
      </div>

      <h1 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        margin: '0 0 8px 0',
        letterSpacing: '1px',
      }}>
        FireHabits
      </h1>

      <p style={{
        fontSize: '0.95rem',
        color: '#888',
        marginBottom: '32px',
        maxWidth: '280px',
        lineHeight: '1.5',
      }}>
        Construa hábitos que mudam sua vida. Sem desculpas.
      </p>

      <Link to="/habitos" style={{
        backgroundColor: '#e60000',
        color: '#fff',
        padding: '14px 0',
        borderRadius: '10px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1rem',
        width: '100%',
        maxWidth: '280px',
        display: 'block',
        textAlign: 'center',
      }}>
        Entrar
      </Link>

      <p style={{
        fontSize: '0.75rem',
        color: '#444',
        marginTop: '40px',
      }}>
        v1.0 — Solo Levelling Mode
      </p>
    </div>
  );
}
