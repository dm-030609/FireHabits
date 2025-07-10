import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#111',
      color: '#fff',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🔥</div>

      <h1 style={{ fontSize: '2.5rem', margin: 0 }}>FireHabits</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        Construa hábitos que mudam sua vida.
      </p>

      <Link to="/habitos" style={{
        backgroundColor: '#e60000',
        color: '#fff',
        padding: '0.75rem 2rem',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1rem',
        minWidth: '180px'
      }}>
        Entrar
      </Link>
    </div>
  );
}
