import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Dashboard() {
  const [progresso, setProgresso] = useState([]);
  const [concluidosHoje, setConcluidosHoje] = useState(0);
  const [habitosAtivos, setHabitosAtivos] = useState(0);
  const [habitosPendentes, setHabitosPendentes] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const fetchProgresso = async () => {
      try {
        const response = await axios.get("/progresso/semana");
        const dados = response.data;

        if (!Array.isArray(dados)) {
          console.error("❌ Progresso recebido não é um array:", dados);
          setProgresso([]);
          return;
        }

        setProgresso(dados);
        setHabitosAtivos(dados.length);

        const hoje = new Date().getDay();
        let concluidos = 0;
        let pendentes = 0;

        dados.forEach((habito) => {
          if (habito.progresso?.[hoje]) concluidos++;
          else pendentes++;
        });

        setConcluidosHoje(concluidos);
        setHabitosPendentes(pendentes);
      } catch (error) {
        console.error("❌ Erro ao buscar progresso:", error);
        setProgresso([]);
      }
    };

    fetchProgresso();
    window.addEventListener("online", () => setIsOffline(false));
    window.addEventListener("offline", () => setIsOffline(true));

    return () => {
      window.removeEventListener("online", () => setIsOffline(false));
      window.removeEventListener("offline", () => setIsOffline(true));
    };
  }, []);

  return (
    <div className="container px-3 py-4">
      <h2 className="text-center text-danger fw-bold mb-4">
        Painel de Controle{" "}
        <span className="badge bg-secondary ms-2">
          {isOffline ? "Offline" : "Online"}
        </span>
      </h2>

      <div className="row row-cols-1 row-cols-md-3 g-3 text-center mb-4">
        <div className="col">
          <div className="p-3 bg-black text-white rounded">
            <h5>Hábitos Ativos</h5>
            <h3 className="text-danger">{habitosAtivos}</h3>
          </div>
        </div>
        <div className="col">
          <div className="p-3 bg-secondary text-white rounded">
            <h5>Concluídos Hoje</h5>
            <h3>{concluidosHoje}</h3>
          </div>
        </div>
        <div className="col">
          <div className="p-3 bg-danger text-white rounded">
            <h5>Pendentes</h5>
            <h3>{habitosPendentes}</h3>
          </div>
        </div>
      </div>

      <h4 className="text-center text-white mb-3">Progresso Semanal</h4>

      {Array.isArray(progresso) &&
        progresso.map((habito) => (
          <div
            key={habito.habitoId}
            className="bg-black rounded text-white px-3 py-2 mb-3 mx-auto"
            style={{ maxWidth: "600px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="text-danger fw-semibold mb-0">{habito.nome}</h5>
            </div>

            <div className="row gx-2 justify-content-center">
              {habito.progresso?.map((feito, idx) => (
                <div key={idx} className="col-auto">
                  <div
                    className="rounded"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: feito ? "#dc3545" : "#6c757d",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

      <Link
        to="/habitos"
        className="btn btn-outline-danger position-fixed botao-voltar"
        style={{ bottom: "20px", right: "20px", zIndex: 999 }}
      >
        🔥 Voltar
      </Link>
    </div>
  );
}

export default Dashboard;
