import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { initDB } from '../utils/indexedDB';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('fh_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('fh_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('fh_token');
    }
  }, [token]);

  useEffect(() => {
    const u = localStorage.getItem('fh_usuario');
    if (u) setUsuario(JSON.parse(u));
    setLoading(false);
  }, []);

  function _setAuth(novoToken, novoUsuario) {
    setToken(novoToken);
    setUsuario(novoUsuario);
    localStorage.setItem('fh_usuario', JSON.stringify(novoUsuario));
  }

  async function register(nome, email, senha) {
    const { data } = await axios.post('/auth/register', { nome, email, senha });
    _setAuth(data.token, data.usuario);
  }

  async function login(email, senha) {
    const { data } = await axios.post('/auth/login', { email, senha });
    _setAuth(data.token, data.usuario);
  }

  async function loginGoogle(idToken) {
    const { data } = await axios.post('/auth/google', { idToken });
    _setAuth(data.token, data.usuario);
  }

  const logout = useCallback(async () => {
    try {
      const db = await initDB();
      const stores = ['habitos', 'pendentes', 'lembretes', 'conclusoes', 'progressoSemana', 'diario', 'tarefas'];
      for (const store of stores) {
        await db.clear(store).catch(() => {});
      }
    } catch (_) {}

    setToken(null);
    setUsuario(null);
    localStorage.removeItem('fh_token');
    localStorage.removeItem('fh_usuario');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, token, loading, register, login, loginGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
