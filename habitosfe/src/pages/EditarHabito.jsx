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

const inputStyle = {
  backgroundColor: '#111',
  color: '#ccc',
  border: '1px solid #333',
  borderRadius: '8px',
  fontSize: '1rem',
  padding: '10px 12px',
};

const labelStyle = {
  fontWeight: 'bold',
  color: '#ccc',
  fontSize: '0.9rem',
  marginBottom: '6px',
  letterSpacing: '0.3px',
};

function EditarHabito() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [habito, setHabito] = useState({ nome: "", descricao: "", frequencia: "", tipo: "Construtivo", status: "" });
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
    <div style={{ backgroundColor: '#111', minHeight: '100vh', padding: '16px' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>

        <button
          onClick={() => navigate("/habitos")}
          style={{
            background: 'none',
            border: '1px solid #e60000',
            color: '#e60000',
            fontWeight: 'bold',
            borderRadius: '8px',
            padding: '8px 16px',
            marginBottom: '16px',
            fontSize: '0.9rem',
          }}
        >
          Voltar
        </button>

        <h2 style={{ color: '#e60000', textAlign: 'center', marginBottom: '24px', fontSize: '1.5rem', fontWeight: 'bold' }}>
          Editar Hábito
        </h2>

        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          {/* Tipo: Construtivo / Destrutivo */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Tipo de Hábito</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Construtivo', 'Destrutivo'].map((t) => {
                const ativo = habito.tipo === t;
                const isDestr = t === 'Destrutivo';
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setHabito(prev => ({ ...prev, tipo: t }))}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      border: ativo
                        ? `2px solid ${isDestr ? '#ff6600' : '#4caf50'}`
                        : '1px solid #333',
                      backgroundColor: ativo
                        ? (isDestr ? '#1a1000' : '#0a1a0a')
                        : '#1a1a1a',
                      color: ativo
                        ? (isDestr ? '#ff6600' : '#4caf50')
                        : '#666',
                    }}
                  >
                    {isDestr ? 'Destrutivo (Evitar)' : 'Construtivo (Criar)'}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Nome</label>
            <input
              name="nome"
              value={habito.nome}
              onChange={handleInputChange}
              required
              style={{ ...inputStyle, width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Descrição</label>
            <textarea
              name="descricao"
              value={habito.descricao}
              onChange={handleInputChange}
              rows={3}
              style={{ ...inputStyle, width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Frequência</label>
            <select
              name="frequencia"
              value={habito.frequencia}
              onChange={handleInputChange}
              required
              style={{ ...inputStyle, width: '100%' }}
            >
              <option value="">Selecione...</option>
              <option value="Diariamente">Diariamente</option>
              <option value="Dias Úteis">Dias Úteis</option>
              <option value="Finais de Semana">Finais de Semana</option>
              <option value="Semanal">Semanal</option>
              <option value="Livre">Livre</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Status</label>
            <select
              name="status"
              value={habito.status}
              onChange={handleInputChange}
              required
              style={{ ...inputStyle, width: '100%' }}
            >
              <option value="Ativo">Ativo</option>
              <option value="Concluído">Concluído</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#e60000',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Atualizar Hábito
          </button>
        </form>

        {/* Lembretes */}
        <div style={{ borderTop: '1px solid #333', paddingTop: '16px' }}>
          <button
            data-bs-toggle="modal"
            data-bs-target="#modalLembrete"
            style={{
              backgroundColor: '#1a1a1a',
              color: '#e60000',
              border: '1px solid #e60000',
              borderRadius: '8px',
              padding: '10px 16px',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: 'pointer',
              width: '100%',
              marginBottom: '16px',
            }}
          >
            Novo Lembrete
          </button>

          {/* Modal de Lembrete */}
          <div
            className="modal fade"
            id="modalLembrete"
            tabIndex="-1"
            aria-labelledby="modalLembreteLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div style={{ backgroundColor: '#1a1a1a', borderRadius: '12px', border: '1px solid #333' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h5 style={{ color: '#e60000', fontWeight: 'bold', margin: 0, fontSize: '1.1rem' }}>Novo Lembrete</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>

                <form onSubmit={handleSalvarLembrete}>
                  <div style={{ padding: '16px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={labelStyle}>Horário</label>
                      <input
                        type="time"
                        required
                        value={horario}
                        onChange={(e) => setHorario(e.target.value)}
                        style={{ ...inputStyle, width: '100%' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={labelStyle}>Mensagem</label>
                      <input
                        type="text"
                        placeholder="Ex: Meditar 10min"
                        required
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                        style={{ ...inputStyle, width: '100%' }}
                      />
                    </div>
                    <label style={labelStyle}>Dias</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {diasSemana.map((dia, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleDia(idx)}
                          style={{
                            backgroundColor: dias.includes(idx) ? '#e60000' : '#111',
                            color: '#fff',
                            border: dias.includes(idx) ? '1px solid #e60000' : '1px solid #444',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            minWidth: '42px',
                            textAlign: 'center',
                          }}
                        >
                          {dia}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: '12px 16px', borderTop: '1px solid #333', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      data-bs-dismiss="modal"
                      style={{
                        backgroundColor: '#333',
                        color: '#ccc',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      data-bs-dismiss="modal"
                      style={{
                        backgroundColor: '#e60000',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                      }}
                    >
                      Salvar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Lista de lembretes */}
          {lembretes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lembretes.map((l, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: '#ccc', fontSize: '0.9rem' }}>
                    {l.horario} — {l.mensagem} ({l.dias.map((i) => diasSemana[i]).join(", ")})
                  </span>
                  <button
                    onClick={() => excluirLembrete(l.id)}
                    style={{
                      background: 'none',
                      border: '1px solid #e60000',
                      color: '#e60000',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditarHabito;
