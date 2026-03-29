{/*import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  salvarLembrete,
  listarLembretesPorHabito,
  deletarLembrete,
} from "../utils/lembrete-db.js";

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function EditarHabito() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [habito, setHabito] = useState({ nome: "", descricao: "", frequencia: "", status: "" });

  // Lembretes
  const [horario, setHorario] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [dias, setDias] = useState([]);
  const [lembretes, setLembretes] = useState([]);

  useEffect(() => {
    axios.get(`/habitos/${id}`).then((res) => setHabito(res.data));
    carregarLembretes();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHabito((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.put(`/habitos/${id}`, habito);
    navigate("/habitos");
  };

  const toggleDia = (i) => {
    setDias(dias.includes(i) ? dias.filter((d) => d !== i) : [...dias, i]);
  };

  const handleSalvarLembrete = async (e) => {
    e.preventDefault();
    await salvarLembrete(id, { horario, mensagem, dias });
    await carregarLembretes();
    setHorario("");
    setMensagem("");
    setDias([]);
  };

  const carregarLembretes = async () => {
    const lista = await listarLembretesPorHabito(id);
    setLembretes(lista);
  };

  const excluirLembrete = async (lembreteId) => {
    await deletarLembrete(lembreteId);
    await carregarLembretes();
  };

  return (
    <div className="container py-5">
      <h2 className="text-danger mb-4">Editar Hábito</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <label className="form-label">Nome</label>
          <input
            name="nome"
            className="form-control"
            value={habito.nome}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Descrição</label>
          <textarea
            name="descricao"
            className="form-control"
            value={habito.descricao}
            onChange={handleInputChange}
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Frequência</label>
          <input
            name="frequencia"
            className="form-control"
            value={habito.frequencia}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Status</label>
          <select
            name="status"
            className="form-select"
            value={habito.status}
            onChange={handleInputChange}
            required
          >
            <option>Ativo</option>
            <option>Concluído</option>
            <option>Inativo</option>
          </select>
        </div>

        <button className="btn btn-danger w-100">Atualizar Hábito</button>
      </form>

      <div className="mt-5">
        <h5 className="text-danger">🔔 Lembretes</h5>

        <form onSubmit={handleSalvarLembrete} className="mb-3">
          <div className="row g-2 align-items-center">
            <div className="col-4">
              <input
                type="time"
                className="form-control"
                required
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
              />
            </div>
            <div className="col">
              <input
                type="text"
                className="form-control"
                placeholder="Mensagem"
                required
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-2">
            {diasSemana.map((dia, idx) => (
              <label key={idx} className="form-check form-check-inline">
                <input
                  type="checkbox"
                  value={idx}
                  checked={dias.includes(idx)}
                  onChange={() => toggleDia(idx)}
                  className="form-check-input"
                />
                <span className="form-check-label">{dia}</span>
              </label>
            ))}
          </div>

          <button className="btn btn-sm btn-danger mt-3">+ Salvar Lembrete</button>
        </form>

        <ul className="list-group">
          {lembretes.map((l, i) => (
            <li key={i} className="list-group-item d-flex justify-content-between">
              <span>
                {l.horario} - {l.mensagem} ({l.dias.map((i) => diasSemana[i]).join(", ")})
              </span>
              <button
                onClick={() => excluirLembrete(l.id)}
                className="btn btn-sm btn-outline-danger"
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default EditarHabito;
*/}

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  salvarLembrete,
  listarLembretesPorHabito,
  deletarLembrete,
} from "../utils/lembrete-db.js";
import { salvarHabitoLocal } from "../utils/indexedDB.js";

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function EditarHabito() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [habito, setHabito] = useState({ nome: "", descricao: "", frequencia: "", status: "" });
  const [horario, setHorario] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [dias, setDias] = useState([]);
  const [lembretes, setLembretes] = useState([]);

  useEffect(() => {
    axios.get(`/habitos/${id}`).then((res) => setHabito(res.data));
    carregarLembretes();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHabito((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (navigator.onLine) {
        await axios.put(`/habitos/${id}`, habito);
      } else {
        console.warn("📴 Editando hábito offline");
        console.log("🧩 ID do hábito:", id);
        console.log("📦 Salvando:", { ...habito, _id: id });
        await salvarHabitoLocal({ ...habito, _id: id });
        alert("📦 Hábito atualizado localmente. Será sincronizado depois.");
      }

      navigate("/habitos");
    } catch (err) {
      console.error("❌ Erro ao editar hábito:", err);
      alert("Erro ao salvar hábito.");
    }
  };


  const toggleDia = (i) => {
    setDias(dias.includes(i) ? dias.filter((d) => d !== i) : [...dias, i]);
  };

  const handleSalvarLembrete = async (e) => {
    e.preventDefault();
    await salvarLembrete(id, { horario, mensagem, dias });
    await carregarLembretes();
    setHorario("");
    setMensagem("");
    setDias([]);
  };

  const carregarLembretes = async () => {
    const lista = await listarLembretesPorHabito(id);
    setLembretes(lista);
  };

  const excluirLembrete = async (lembreteId) => {
    await deletarLembrete(lembreteId);
    await carregarLembretes();
  };

  return (
    <div className="container py-5">
      <h2 className="text-danger mb-4">Editar Hábito</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <label className="form-label">Nome</label>
          <input
            name="nome"
            className="form-control"
            value={habito.nome}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Descrição</label>
          <textarea
            name="descricao"
            className="form-control"
            value={habito.descricao}
            onChange={handleInputChange}
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Frequência</label>
          <input
            name="frequencia"
            className="form-control"
            value={habito.frequencia}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Status</label>
          <select
            name="status"
            className="form-select"
            value={habito.status}
            onChange={handleInputChange}
            required
          >
            <option>Ativo</option>
            <option>Concluído</option>
            <option>Inativo</option>
          </select>
        </div>

        <button className="btn btn-danger w-100">Atualizar Hábito</button>
      </form>

      {/* Botão para abrir o modal */}
      <button
        className="btn btn-danger mb-3"
        data-bs-toggle="modal"
        data-bs-target="#modalLembrete"
      >
        🔔 Novo Lembrete
      </button>

      {/* Modal de Lembrete */}
      <div
        className="modal fade"
        id="modalLembrete"
        tabIndex="-1"
        aria-labelledby="modalLembreteLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content bg-dark text-white">
            <div className="modal-header">
              <h5 className="modal-title text-danger" id="modalLembreteLabel">Novo Lembrete</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <form onSubmit={handleSalvarLembrete}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Horário</label>
                  <input
                    type="time"
                    className="form-control"
                    required
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mensagem</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Meditar 10min"
                    required
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                  />
                </div>
                <div className="mb-2">Dias:</div>
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
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  data-bs-dismiss="modal"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ul className="list-group mt-4">
        {lembretes.map((l, i) => (
          <li key={i} className="list-group-item d-flex justify-content-between">
            <span>
              {l.horario} - {l.mensagem} ({l.dias.map((i) => diasSemana[i]).join(", ")})
            </span>
            <button
              onClick={() => excluirLembrete(l.id)}
              className="btn btn-sm btn-outline-danger"
            >
              🗑
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EditarHabito;
