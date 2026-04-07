import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login, loginGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await login(email, senha);
      navigate('/habitos', { replace: true });
    } catch (err) {
      setErro(err?.response?.data?.erro || 'Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  }

  async function handleGoogle(credentialResponse) {
    setErro('');
    setCarregando(true);
    try {
      await loginGoogle(credentialResponse.credential);
      navigate('/habitos', { replace: true });
    } catch (err) {
      setErro(err?.response?.data?.erro || 'Erro ao autenticar com Google');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="text-center mb-4">
          <h1 style={{ color: '#e60000', fontWeight: 900, fontSize: '2rem', letterSpacing: 2 }}>🔥 FireHabits</h1>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>Seu campo de batalha pessoal</p>
        </div>

        <div style={{ background: '#1a1a1a', borderRadius: 12, padding: '2rem', border: '1px solid #2a2a2a' }}>
          <h5 style={{ color: '#fff', fontWeight: 700, marginBottom: '1.5rem' }}>Entrar na Missão</h5>

          {erro && (
            <div className="alert alert-danger py-2" style={{ fontSize: '0.85rem' }}>{erro}</div>
          )}

          <form onSubmit={handleSubmit}>
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
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="btn btn-danger w-100 fw-bold"
              disabled={carregando}
              style={{ letterSpacing: 1 }}
            >
              {carregando ? 'ENTRANDO...' : 'ENTRAR'}
            </button>
          </form>

          <div className="d-flex align-items-center my-3">
            <hr style={{ flex: 1, borderColor: '#333' }} />
            <span style={{ color: '#555', padding: '0 0.75rem', fontSize: '0.8rem' }}>ou</span>
            <hr style={{ flex: 1, borderColor: '#333' }} />
          </div>

          <div className="d-flex justify-content-center">
            <GoogleLogin
              onSuccess={handleGoogle}
              onError={() => setErro('Falha no login com Google')}
              theme="filled_black"
              shape="rectangular"
              text="signin_with"
            />
          </div>

          <p className="text-center mt-4 mb-0" style={{ color: '#666', fontSize: '0.85rem' }}>
            Novo por aqui?{' '}
            <Link to="/register" style={{ color: '#e60000', fontWeight: 600 }}>Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
