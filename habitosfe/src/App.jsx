import { Routes, Route, useLocation } from 'react-router-dom';
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
import BottomTabBar from './components/BottomTabBar.jsx';
import { useEffect } from "react";
import { iniciarVerificadorLembretes } from "./utils/lembrete-db";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { iniciarMonitorSincronizacao } from './utils/syncDB.js';

const PAGES_SEM_TAB = ['/', '/teste'];

function App() {
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
        <Route path="/" element={<Home />} />
        <Route path="/teste" element={<div>rota teste ok</div>} />
        <Route path="/habitos" element={<Habitos />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/diario" element={<Diario />} />
        <Route path="/tarefas" element={<Tarefas />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/revisao" element={<Revisao />} />
        <Route path="/criar" element={<CriarHabitos />} />
        <Route path="/editar/:id" element={<EditarHabito />} />
        <Route path="/editarHabito/:id" element={<EditarHabito />} />
      </Routes>
      {showTabBar && <BottomTabBar />}
    </>
  );
}

export default App;
