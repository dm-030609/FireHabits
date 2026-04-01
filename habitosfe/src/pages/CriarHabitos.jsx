import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { salvarLembrete } from "../utils/lembrete-db.js";
import { salvarHabitoLocal } from "../utils/indexedDB.js";
import { salvarAcaoPendente } from "../utils/syncDB.js";

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

function CriarHabito() {
  const navigate = useNavigate();
  const [habito, setHabito] = useState({
    nome: "",
    descricao: "",
    frequencia: "",
    tipo: "Construtivo",
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

    let novoHabito = {
      ...habito,
      _id: Date.now().toString(),
      criadoEm: new Date().toISOString(),
    };

    try {
      if (navigator.onLine) {
        const res = await axios.post("/habitos", habito);
        if (res.data && res.data._id) {
          novoHabito = res.data;
        } else {
          throw new Error("Resposta do backend não contém _id");
        }
      } else {
        await salvarHabitoLocal(novoHabito);
        await salvarAcaoPendente({
          type: 'criar',
          dados: novoHabito,
          timestamp: Date.now()
        });
      }

      if (novoHabito._id && horario && mensagem && dias.length > 0) {
        await salvarLembrete(novoHabito._id, { horario, mensagem, dias });
      }

      navigate("/habitos");
    } catch (err) {
      console.error("Erro ao salvar hábito:", err);
      alert("Erro ao salvar hábito.");
    }
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
          Novo Hábito
        </h2>

        <form onSubmit={handleSubmit}>
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
              type="text"
              name="nome"
              value={habito.nome}
              onChange={handleChange}
              required
              placeholder="Ex: Meditar 10 minutos"
              style={{ ...inputStyle, width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Descrição</label>
            <textarea
              name="descricao"
              value={habito.descricao}
              onChange={handleChange}
              rows={3}
              placeholder="Detalhes sobre o hábito..."
              style={{ ...inputStyle, width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Frequência</label>
            <select
              name="frequencia"
              value={habito.frequencia}
              onChange={handleChange}
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
              onChange={handleChange}
              required
              style={{ ...inputStyle, width: '100%' }}
            >
              <option value="Ativo">Ativo</option>
              <option value="Concluído">Concluído</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>

          {/* Lembrete */}
          <div style={{
            borderTop: '1px solid #333',
            paddingTop: '16px',
            marginBottom: '20px',
          }}>
            <h5 style={{ color: '#e60000', fontWeight: 'bold', fontSize: '1rem', marginBottom: '12px' }}>
              Lembrete (opcional)
            </h5>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                style={{ ...inputStyle, flex: '0 0 120px' }}
              />
              <input
                type="text"
                placeholder="Mensagem"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {diasSemana.map((dia, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDia(idx)}
                  style={{
                    backgroundColor: dias.includes(idx) ? '#e60000' : '#1a1a1a',
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
            Criar Hábito
          </button>
        </form>
      </div>
    </div>
  );
}

export default CriarHabito;
