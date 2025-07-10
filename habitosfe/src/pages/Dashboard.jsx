import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Row, Col, Card, Spinner, Badge
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { listarHabitosLocal } from '../../indexedDB';

export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [progresso, setProgresso] = useState([]);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const res = await axios.get('http://localhost:3000/habitos/resumo');
        setDados(res.data);
        setOffline(false);
      } catch {
        const locais = await listarHabitosLocal();
        const ativos = locais.length;
        const concluidosHoje = locais.filter(h => h.status === 'Concluído').length;
        const pendentes = locais.filter(h => h.status === 'Pendente').length;
        const fakeResumo = {
          ativos,
          concluidosHoje,
          pendentes
        };
        setDados(fakeResumo);
        setOffline(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, []);

  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh', color: '#fff', paddingBottom: '5rem' }}>
      <Container className="py-4">
        <h2 className="text-danger text-center mb-4">
          Painel de Controle{' '}
          {offline && (
            <Badge bg="secondary" className="ms-2">
              (Offline)
            </Badge>
          )}
        </h2>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="danger" />
          </div>
        ) : (
          <Row className="g-4 justify-content-center text-center">
            <Col xs={12} md={4}>
              <Card className="bg-black text-white rounded-4 shadow-sm">
                <Card.Body>
                  <Card.Title>Hábitos Ativos</Card.Title>
                  <h3 className="text-danger">{dados.ativos}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card className="bg-secondary text-white rounded-4 shadow-sm">
                <Card.Body>
                  <Card.Title>Concluídos Hoje</Card.Title>
                  <h3>{dados.concluidosHoje}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card className="bg-danger text-white rounded-4 shadow-sm">
                <Card.Body>
                  <Card.Title>Pendentes</Card.Title>
                  <h3>{dados.pendentes}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        <h4 className="text-center mt-5 mb-3">Progresso Semanal</h4>
        <div style={{ backgroundColor: '#000', height: '30px', borderRadius: '8px', marginBottom: '2rem' }}>
          {/* Aqui entra o gráfico real futuramente */}
        </div>
      </Container>

      {/* Botão flutuante com ícone 🔥 */}
      <Link to="/habitos" style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#e60000',
        borderRadius: '50%',
        width: '56px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.5rem',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        zIndex: 999
      }}>
        🔥
      </Link>
    </div>
  );
}
