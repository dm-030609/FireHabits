import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Habitos from './pages/Habitos.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CriarHabitos from './pages/CriarHabitos.jsx';
import EditarHabito from './pages/EditarHabito.jsx';
import Diario from './pages/Diario.jsx';
import Tarefas from './pages/Tarefas.jsx';
import Pomodoro from './pages/Pomodoro.jsx';
import Calendario from './pages/Calendario.jsx';
import Revisao from './pages/Revisao.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import BottomTabBar from './components/BottomTabBar.jsx';
import { useEffect } from 'react';
import { iniciarVerificadorLembretes } from './utils/lembrete-db';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { iniciarMonitorSincronizacao } from './utils/syncDB.js';

const PAGES_SEM_TAB = ['/login', '/register', '/teste'];

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function AppRoutes() {
  const location = useLocation();
  const showTabBar = !PAGES_SEM_TAB.includes(location.pathname);

  useEffect(() => {
    iniciarVerificadorLembretes();
  }, []);

  useEffect(() => {
    iniciarMonitorSincronizacao();
  }, []);

  return (
    <>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/teste" element={<div>rota teste ok</div>} />

        {/* Redireciona raiz para /habitos */}
        <Route path="/" element={<Navigate to="/habitos" replace />} />

        {/* Protegidas */}
        <Route path="/habitos" element={<ProtectedRoute><Habitos /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/diario" element={<ProtectedRoute><Diario /></ProtectedRoute>} />
        <Route path="/tarefas" element={<ProtectedRoute><Tarefas /></ProtectedRoute>} />
        <Route path="/pomodoro" element={<ProtectedRoute><Pomodoro /></ProtectedRoute>} />
        <Route path="/calendario" element={<ProtectedRoute><Calendario /></ProtectedRoute>} />
        <Route path="/revisao" element={<ProtectedRoute><Revisao /></ProtectedRoute>} />
        <Route path="/criar" element={<ProtectedRoute><CriarHabitos /></ProtectedRoute>} />
        <Route path="/editar/:id" element={<ProtectedRoute><EditarHabito /></ProtectedRoute>} />
        <Route path="/editarHabito/:id" element={<ProtectedRoute><EditarHabito /></ProtectedRoute>} />
      </Routes>
      {showTabBar && <BottomTabBar />}
    </>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
