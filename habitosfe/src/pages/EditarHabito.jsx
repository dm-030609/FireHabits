import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';

function EditarHabito() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [habito, setHabito] = useState({ nome: '', descricao: '', frequencia: '', status: 'Ativo' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:3000/habitos/${id}`)
      .then(res => {
        setHabito(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao carregar hábito');
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setHabito({ ...habito, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/habitos/${id}`, habito);
      navigate('/habitos');
    } catch {
      setError('Erro ao atualizar hábito');
    }
  };

  if (loading) return <div className="text-center mt-5">Carregando...</div>;

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-dark text-light">
      <Container style={{ maxWidth: '500px' }}>
        <h2 className="text-danger mb-4">Editar Hábito</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nome</Form.Label>
            <Form.Control type="text" name="nome" value={habito.nome} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descrição</Form.Label>
            <Form.Control as="textarea" name="descricao" value={habito.descricao} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Frequência</Form.Label>
            <Form.Control type="text" name="frequencia" value={habito.frequencia} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Status</Form.Label>
            <Form.Select name="status" value={habito.status} onChange={handleChange} required>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Pendente">Pendente</option>
              <option value="Concluído">Concluído</option>
            </Form.Select>
          </Form.Group>

          <Button variant="danger" type="submit" className="w-100">Atualizar Hábito</Button>
        </Form>
      </Container>
    </div>
  );
}

export default EditarHabito;
