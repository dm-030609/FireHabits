import { Routes, Route } from 'react-router-dom';
import Habitos from './pages/Habitos.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CriarHabitos from './pages/CriarHabitos.jsx';
import EditarHabito from './pages/EditarHabito.jsx';

//import Dashboard from './pages/Dashboard';
//import Perfil from './pages/Perfil';
//import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/teste" element={<div>rota teste ok</div>} />
      <Route path="/habitos" element={<Habitos />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/criar" element={<CriarHabitos />} />
      <Route path="/editar/:id" element={<EditarHabito />} />
      {/*<Route path="/dashboard" element={<Dashboard />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="*" element={<NotFound />} />*/}
    </Routes>
  );
}

export default App;
