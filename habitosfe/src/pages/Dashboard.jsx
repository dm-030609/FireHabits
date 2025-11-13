import React, { useEffect, useState } from "react";
import axios from "axios";
import WeeklyBar from "../components/WeeklyBar.jsx";
import { Link } from "react-router-dom";
import {
  salvarProgressoSemana,
  carregarProgressoSemana,
} from "../utils/indexedDB.js";

function Dashboard() {
  const [dadosSemana, setDadosSemana] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [loading, setLoading] = useState(true);

  // --------------------------
  // Buscar progresso SEMANAL
  // --------------------------
  const fetchProgresso = async () => {
    try {
      if (navigator.onLine) {
        console.log("🟢 ONLINE → buscando progresso do backend...");

        const response = await axios.get("/progresso/semana");
        const dados = response.data;

        // Salvar no IndexedDB
        await salvarProgressoSemana(dados);

        setDadosSemana(dados);
        setLoading(false);
      } else {
        console.log("🔴 OFFLINE → carregando progresso do IndexedDB...");

        const cache = await carregarProgressoSemana();
        setDadosSemana(cache);
        setLoading(false);
      }
    } catch (err) {
      console.error("❌ Erro ao carregar progresso:", err);

      // fallback: tentar usar cache
      const cache = await carregarProgressoSemana();
      setDadosSemana(cache);
      setLoading(false);
    }
  };

  // --------------------------
  // Efeitos: Online/Offline + fetch inicial
  // --------------------------
  useEffect(() => {
    fetchProgresso();

    const onlineHandler = () => {
      setIsOffline(false);
      fetchProgresso();
    };

    const offlineHandler = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);

    return () => {
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
    };
  }, []);

  // --------------------------
  // Loading
  // --------------------------
  if (loading) {
    return (
      <div className="container text-center py-5">
        <h3 className="text-danger">Carregando progresso...</h3>
      </div>
    );
  }

  if (!dadosSemana || !dadosSemana.habitos) {
    return (
      <div className="container text-center py-5">
        <h3 className="text-danger">Nenhum dado disponível.</h3>
      </div>
    );
  }

  // --------------------------
  // Estatísticas do Dashboard
  // --------------------------
  const habitos = dadosSemana.habitos;
  const ativos = habitos.length;

  const concluidosHoje = (() => {
    const hojeIndex = new Date().getDay(); // 0 = domingo, 1 = seg...
    // converter para padrão SEG–DOM
    const map = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };
    const idx = map[hojeIndex];

    return habitos.filter((h) => h.progresso[idx] === true).length;
  })();

  const pendentesHoje = ativos - concluidosHoje;

  // --------------------------
  // UI principal
  // --------------------------
  // --------------------------
// UI principal
// --------------------------
// --------------------------
// UI principal – versão minimalista total
// --------------------------
return (
  <div className="dashboard-container">

    {/* TÍTULO ÚNICO */}
    <h3 className="text-center text-white mb-4">Progresso Semanal</h3>

    {/* WEEKLY BARS */}
    {habitos.map((hab) => (
      <WeeklyBar
        key={hab.habitoId}
        nome={hab.nome}
        progresso={hab.progresso}
        semanal={hab.semanal}
        total={hab.total}
      />
    ))}

    {/* BOTÃO FLUTUANTE DE VOLTAR */}
    <Link
      to="/habitos"
      className="btn btn-outline-danger position-fixed"
      style={{ bottom: "20px", right: "20px", zIndex: 999 }}
    >
      🔥 Voltar
    </Link>
  </div>
);


}

export default Dashboard;
