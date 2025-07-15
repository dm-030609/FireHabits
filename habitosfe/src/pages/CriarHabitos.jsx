// src/pages/CriarHabito.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { salvarLembrete } from "../utils/lembrete-db.js";

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function CriarHabito() {
  const navigate = useNavigate();
  const [habito, setHabito] = useState({
    nome: "",
    descricao: "",
    frequencia: "",
    status: "Ativo",
  });

  const [horario, setHorario] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [dias, setDias] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHabito((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDia = (i) => {
    setDias(dias.includes(i) ? dias.filter((d) => d !== i) : [...dias, i]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post("/habitos", habito);
    const novoHabito = res.data;

    if (horario && mensagem && dias.length > 0) {
      await salvarLembrete(novoHabito._id, { horario, mensagem, dias });
    }

    navigate("/habitos");
  };

  return (
    <div className="container py-5">
      <button
        onClick={() => navigate("/habitos")}
        className="btn btn-outline-danger mb-3"
      >
        🔥 Voltar
      </button>

      <h2 className="text-center text-danger mb-4">Novo Hábito</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nome</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ex: Acordar cedo"
            name="nome"
            value={habito.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Descrição</label>
          <textarea
            className="form-control"
            placeholder="Detalhes do hábito..."
            name="descricao"
            value={habito.descricao}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Frequência</label>
          <input
            type="text"
            className="form-control"
            placeholder="Diário, Semanal, etc."
            name="frequencia"
            value={habito.frequencia}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="form-label">Status</label>
          <select
            name="status"
            className="form-select"
            value={habito.status}
            onChange={handleChange}
            required
          >
            <option>Ativo</option>
            <option>Concluído</option>
            <option>Inativo</option>
          </select>
        </div>

        <h5 className="text-danger">🔔 Lembrete (opcional)</h5>
        <div className="row g-2 align-items-center mb-2">
          <div className="col-4">
            <input
              type="time"
              className="form-control"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
            />
          </div>
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Mensagem"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          {diasSemana.map((dia, idx) => (
            <label key={idx} className="form-check form-check-inline">
              <input
                type="checkbox"
                className="form-check-input"
                checked={dias.includes(idx)}
                onChange={() => toggleDia(idx)}
              />
              <span className="form-check-label">{dia}</span>
            </label>
          ))}
        </div>

        <button className="btn btn-danger w-100">Criar Hábito</button>
      </form>
    </div>
  );
}

export default CriarHabito;
