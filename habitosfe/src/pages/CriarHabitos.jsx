import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
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
        const offlineHabito = { ...form, _id: Date.now().toString() }; // gera _id fake
        await salvarHabitoLocal(offlineHabito);
        navigate('/habitos');
        setErro('Erro ao criar hábito.');
    }
  };

  return (
    <div className="bg-dark text-light min-vh-100 d-flex align-items-center justify-content-center p-3">
      <Container fluid="md">
        <h2 className="text-danger mb-4 text-center">Novo Hábito</h2>

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

          <Button type="submit" variant="danger" className="w-100">
            Criar Hábito
          </Button>
        </Form>
      </Container>
    </div>
  );
}

export default CriarHabito;
