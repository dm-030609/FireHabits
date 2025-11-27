import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Navbar, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

import {
  initDB,
  salvarMultiplosHabitos,
  listarHabitosLocal,
  removerHabitoLocal,
  salvarHabitoLocal,
  salvarConclusaoDia,
  pegarConclusaoDia
} from '../utils/indexedDB.js';

import { salvarAcaoPendente } from '../utils/syncDB.js';

function Habitos() {
  const [habitos, setHabitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ======================================================
     🔥 Função PRO: aplica status diário
  ====================================================== */
  const aplicarStatusDiario = useCallback(async (lista) => {
    const hoje = new Date().toISOString().split("T")[0];

    const novaLista = [];

    for (const h of lista) {
      const concluido = await pegarConclusaoDia(h._id, hoje);

      novaLista.push({
        ...h,
        statusHoje: concluido ? "Concluído" : "Pendente"
      });
    }

    return novaLista;
  }, []);

  /* ======================================================
     🔥 Buscar hábitos (com fallback + status diário)
  ====================================================== */
  const fetchHabitos = useCallback(async () => {
    try {
      const res = await axios.get('/habitos');
      let lista = res.data;

      await salvarMultiplosHabitos(lista);

      lista = await aplicarStatusDiario(lista);

      setHabitos(lista);

    } catch (err) {
      console.warn("⚠ Backend falhou → carregando IndexedDB");

      let locais = await listarHabitosLocal();
      locais = await aplicarStatusDiario(locais);

      setHabitos(locais);
    } finally {
      setLoading(false);
    }
  }, [aplicarStatusDiario]);

  /* ======================================================
     🔥 Inicialização PRO (IndexedDB inicializa só 1x)
  ====================================================== */
  useEffect(() => {
    const start = async () => {
      await initDB();      // IndexedDB pronto
      await fetchHabitos();
    };
    start();
  }, [fetchHabitos]);

  /* ======================================================
     🔥 Concluir hábito (otimizado + status diário)
  ====================================================== */
  const concluirHabito = async (id) => {
    try {
      const hoje = new Date().toISOString().split("T")[0];

      const habitoAtual = habitos.find(h => h._id === id);
      if (!habitoAtual) throw new Error("Hábito não encontrado");

      // 1) Salvar conclusão diária local
      await salvarConclusaoDia(id, hoje);

      // 2) Atualização visual imediata
      const habitoUpdate = {
        ...habitoAtual,
        statusHoje: "Concluído"
      };

      setHabitos(prev =>
        prev.map(h => h._id === id ? habitoUpdate : h)
      );

      await salvarHabitoLocal(habitoUpdate);

      // 3) Se online → manda para backend
      if (navigator.onLine) {
        await axios.post(`/registro`, {
          habitoId: id,
          data: hoje
        });
      } else {
        // offline → salva para sync
        await salvarAcaoPendente({
          type: 'concluir-dia',
          habitoId: id,
          data: hoje,
          timestamp: Date.now()
        });
      }

    } catch (err) {
      console.error("❌ Erro ao concluir hábito:", err);
      alert("Erro ao concluir hábito (backend). Conclusão local foi salva.");
    }
  };

  /* ======================================================
     🔥 Excluir hábito
  ====================================================== */
  const excluirHabito = async (id) => {
    try {
      if (navigator.onLine) {
        await axios.delete(`/habitos/${id}`);
      }

      setHabitos(prev => prev.filter(h => h._id !== id));
      await removerHabitoLocal(id);

    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Falha ao excluir hábito.");
    }
  };

  /* ======================================================
     🔥 UI
  ====================================================== */
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

        <Row className="justify-content-center px-2">
          {habitos.length > 0 ? habitos.map((habito) => (
            <Col key={habito._id} xs={12} sm={6} md={4} lg={3} className="mb-4 d-flex">
              <Card className="bg-dark text-white shadow-sm rounded-4 p-3 w-100 h-100">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="text-danger fw-bold">{habito.nome}</Card.Title>
                  <Card.Text>{habito.descricao}</Card.Text>
                  <Card.Text><strong>Frequência:</strong> {habito.frequencia}</Card.Text>
                  <Card.Text><strong>Status hoje:</strong> {habito.statusHoje}</Card.Text>

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
                          borderRadius: '6px'
                        }}
                        onClick={() => navigate(`/editar/${habito._id}`)}
                      >
                        Editar
                      </Button>

                      <Button
                        size="sm"
                        disabled={habito.statusHoje === 'Concluído'}
                        style={{
                          backgroundColor: habito.statusHoje === 'Concluído' ? '#555' : '#e60000',
                          color: '#fff',
                          border: 'none',
                          flex: 1,
                          fontWeight: 'bold',
                          borderRadius: '6px',
                          cursor: habito.statusHoje === 'Concluído' ? 'not-allowed' : 'pointer'
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
                        borderRadius: '6px'
                      }}
                      onClick={() => excluirHabito(habito._id)}
                    >
                      Excluir
                    </Button>

                  </div>
                </Card.Body>
              </Card>
            </Col>
          )) : (
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
            fontSize: '1.5rem'
          }}
        >
          🔥
        </Link>

      </Container>
    </>
  );
}

export default Habitos;
