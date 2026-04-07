import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setCarregando(true);
    try {
      await register(nome, email, senha);
      navigate('/habitos', { replace: true });
    } catch (err) {
      setErro(err?.response?.data?.erro || 'Erro ao criar conta');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="text-center mb-4">
          <h1 style={{ color: '#e60000', fontWeight: 900, fontSize: '2rem', letterSpacing: 2 }}>🔥 FireHabits</h1>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>Comece sua transformação</p>
        </div>

        <div style={{ background: '#1a1a1a', borderRadius: 12, padding: '2rem', border: '1px solid #2a2a2a' }}>
          <h5 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.5rem' }}>Criar Conta</h5>

          {erro && (
            <div className="alert alert-danger py-2" style={{ fontSize: '0.85rem' }}>{erro}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label style={{ color: '#ccc', fontWeight: 600, fontSize: '0.85rem' }}>NOME</label>
              <input
                type="text"
                className="form-control"
                value={nome}
                onChange={e => setNome(e.target.value)}
                style={{ background: '#111', border: '1px solid #333', color: '#fff' }}
                placeholder="Seu nome"
              />
            </div>
            <div className="mb-3">
              <label style={{ color: '#ccc', fontWeight: 600, fontSize: '0.85rem' }}>EMAIL</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ background: '#111', border: '1px solid #333', color: '#fff' }}
                placeholder="seu@email.com"
              />
            </div>
            <div className="mb-4">
              <label style={{ color: '#ccc', fontWeight: 600, fontSize: '0.85rem' }}>SENHA</label>
              <input
                type="password"
                className="form-control"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                style={{ background: '#111', border: '1px solid #333', color: '#fff' }}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <button
              type="submit"
              className="btn btn-danger w-100 fw-bold"
              disabled={carregando}
              style={{ letterSpacing: 1 }}
            >
              {carregando ? 'CRIANDO...' : 'CRIAR CONTA'}
            </button>
          </form>

          <p className="text-center mt-4 mb-0" style={{ color: '#666', fontSize: '0.85rem' }}>
            Já tem conta?{' '}
            <Link to="/login" style={{ color: '#e60000', fontWeight: 600 }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
