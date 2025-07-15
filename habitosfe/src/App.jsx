import { Routes, Route } from 'react-router-dom';
import Habitos from './pages/Habitos.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CriarHabitos from './pages/CriarHabitos.jsx';
import EditarHabito from './pages/EditarHabito.jsx';
import { useEffect } from "react";
import { iniciarVerificadorLembretes } from "./utils/lembrete-db";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  useEffect(() => {
    iniciarVerificadorLembretes();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/teste" element={<div>rota teste ok</div>} />
      <Route path="/habitos" element={<Habitos />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/criar" element={<CriarHabitos />} />
      <Route path="/editar/:id" element={<EditarHabito />} />
      <Route path="/editarHabito/:id" element={<EditarHabito />} />
    </Routes>
  );
}

export default App;
