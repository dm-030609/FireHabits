import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Navbar, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
  salvarMultiplosHabitos,
  listarHabitosLocal,
  removerHabitoLocal,
  salvarHabitoLocal,
} from '../utils/indexedDB.js';
import { salvarAcaoPendente } from '../utils/syncDB.js';



function Habitos() {
  const [habitos, setHabitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHabitos = async () => {
      try {
        const res = await axios.get('https://firehabits.onrender.com/habitos');
        setHabitos(res.data);
        await salvarMultiplosHabitos(res.data);
      } catch (err) {
        console.warn('Falha ao buscar da API, tentando IndexedDB...');
        const locais = await listarHabitosLocal();
        setHabitos(locais);
        setError('Conectado via cache local');
      } finally {
        setLoading(false);
      }
    };

    fetchHabitos();
  }, []);


  const concluirHabito = async (id) => {
    try {
      const habitoAtual = habitos.find(h => h._id === id);

      if (!habitoAtual) {
        throw new Error("Hábito não encontrado");
      }

      const habitoAtualizado = { ...habitoAtual, status: 'Concluído' };

      if (navigator.onLine) {
        await axios.put(`https://firehabits.onrender.com/habitos/${id}`, { status: 'Concluído' });
      } else {
        await salvarAcaoPendente({
          type: 'concluir',
          habitoId: id,
          dados: {
            ...habitoAtual,
            status: 'Concluído'
          },
          timestamp: new Date().getTime()
        });

        console.log('✅ Ação armazenada localmente');
      }

      // Atualiza visualmente e local
      await salvarHabitoLocal(habitoAtualizado);
      setHabitos(prev => prev.map(h =>
        h._id === id ? habitoAtualizado : h
      ));

    } catch (err) {
      console.error("❌ Erro ao concluir hábito:", err);
      alert("Erro ao concluir hábito");
    }
  };



  const excluirHabito = async (id) => {
    if (navigator.onLine) {
      await axios.delete(`https://firehabits.onrender.com/habitos/${id}`);
    } else {
      console.warn("📴 Excluindo hábito localmente (offline)");
    }
    setHabitos(habitos.filter((h) => h._id !== id));
    await removerHabitoLocal(id);
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
        <Navbar.Brand as={Link} to="/" className="fw-bold text-danger">FireHabits</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Início</Nav.Link>
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container fluid="md" className="py-4">
        <h2 className="text-danger mb-3 text-center fs-2">Meus Hábitos</h2>

        {loading && (
          <div className="text-center">
            <Spinner animation="border" variant="danger" />
          </div>
        )}
        {error && <div className="text-center text-warning">{error}</div>}

        {console.log("🔥 Lista de hábitos:", habitos)}

        <Row className="justify-content-center px-2">
          {Array.isArray(habitos) && habitos.length > 0 ? (
            habitos.map((habito) => (
              <Col
                key={habito._id}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                className="mb-4 d-flex"
              >
                <Card className="bg-dark text-white shadow-sm rounded-4 p-3 w-100 h-100">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="text-danger fw-bold">{habito.nome}</Card.Title>
                    <Card.Text>{habito.descricao}</Card.Text>
                    <Card.Text><strong>Frequência:</strong> {habito.frequencia}</Card.Text>
                    <Card.Text><strong>Status:</strong> {habito.status}</Card.Text>

                    <div className="d-flex flex-column gap-2 mt-auto pt-3">
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          style={{
                            backgroundColor: '#fff',
                            color: '#111',
                            border: 'none',
                            flex: 1,
                            fontWeight: 'bold',
                            borderRadius: '6px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f2f2f2'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                          onClick={() => navigate(`/editar/${habito._id}`)}
                        >
                          Editar
                        </Button>

                        <Button
                          size="sm"
                          disabled={habito.status === 'Concluído'}
                          style={{
                            backgroundColor: habito.status === 'Concluído' ? '#555' : '#e60000',
                            color: '#fff',
                            border: 'none',
                            flex: 1,
                            fontWeight: 'bold',
                            borderRadius: '6px',
                            transition: 'all 0.2s ease',
                            cursor: habito.status === 'Concluído' ? 'not-allowed' : 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            if (habito.status !== 'Concluído') e.currentTarget.style.backgroundColor = '#cc0000';
                          }}
                          onMouseLeave={(e) => {
                            if (habito.status !== 'Concluído') e.currentTarget.style.backgroundColor = '#e60000';
                          }}
                          onClick={() => concluirHabito(habito._id)}
                        >
                          Concluir
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        style={{
                          backgroundColor: '#333',
                          color: '#fff',
                          border: 'none',
                          fontWeight: 'bold',
                          borderRadius: '6px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
                        onClick={() => excluirHabito(habito._id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p className="text-center text-muted">Nenhum hábito encontrado.</p>
          )}
        </Row>

        <Link
          to="/criar"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            backgroundColor: '#1a1a1a',
            border: '2px solid #dc3545',
            borderRadius: '12px',
            boxShadow: '0 0 15px rgba(255, 0, 0, 0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            transition: 'transform 0.2s ease-in-out',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          🔥
        </Link>
      </Container>
    </>
  );
}

export default Habitos;
