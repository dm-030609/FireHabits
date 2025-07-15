import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { salvarHabitoLocal } from '../../indexedDB';

function CriarHabito() {
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    frequencia: '',
    status: 'Ativo',
  });
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/habitos', form);
      navigate('/habitos');
    } catch (err) {
      const offlineHabito = { ...form, _id: Date.now().toString() };
      await salvarHabitoLocal(offlineHabito);
      navigate('/habitos');
      setErro('Erro ao criar hábito.');
    }
  };

  return (
    <div className="bg-dark text-light min-vh-100 py-5">
      <Container style={{ maxWidth: '600px' }}>
       <div className="mb-4">
          {/* Botão voltar */}
          <div className="mb-3 d-flex d-md-block justify-content-center">
            <Link
              to="/habitos"
              className="d-flex align-items-center gap-2"
              style={{
                backgroundColor: '#111',
                border: '2px solid #dc3545',
                padding: '0.25rem 0.7rem',
                borderRadius: '6px',
                color: '#dc3545',
                fontWeight: 'bold',
                textDecoration: 'none',
                fontSize: '0.85rem',
                lineHeight: '1',
                boxShadow: '0 0 8px rgba(255, 0, 0, 0.4)',
                transition: 'transform 0.2s ease-in-out',
                maxWidth: 'fit-content',
              }}

              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span style={{ fontSize: '1.2rem' }}>🔥</span>
              <span>Voltar</span>
            </Link>
          </div>

          {/* Título centralizado REAL */}
          <h2 className="text-danger text-center m-0">Novo Hábito</h2>
        </div>


        {erro && <Alert variant="danger">{erro}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Ex: Acordar cedo"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              placeholder="Detalhes do hábito..."
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Frequência</Form.Label>
            <Form.Control
              type="text"
              name="frequencia"
              value={form.frequencia}
              onChange={handleChange}
              placeholder="Diário, Semanal, etc."
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Status</Form.Label>
            <Form.Select name="status" value={form.status} onChange={handleChange}>
              <option>Ativo</option>
              <option>Pendente</option>
              <option>Concluído</option>
            </Form.Select>
          </Form.Group>

          <Button
            type="submit"
            className="w-100 fw-bold"
            style={{
              backgroundColor: '#111',
              border: '2px solid #dc3545',
              color: '#dc3545',
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)',
              fontSize: '1.1rem',
              padding: '0.75rem',
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Criar Hábito
          </Button>
        </Form>
      </Container>
    </div>
  );
}

export default CriarHabito;
