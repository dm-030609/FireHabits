const express = require('express');
const router = express.Router();
const Diario = require('../models/diario');
const auth = require('../middlewares/auth');

router.use(auth);

// GET /diario
router.get('/', async (req, res) => {
  try {
    const filtro = { usuarioId: req.usuarioId };
    if (req.query.data) {
      const d = new Date(req.query.data);
      d.setUTCHours(0, 0, 0, 0);
      filtro.data = d;
    }
    const entradas = await Diario.find(filtro).sort({ data: -1 });
    res.json(entradas);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar diário', detalhes: err.message });
  }
});

// POST /diario (upsert por data+usuário)
router.post('/', async (req, res) => {
  try {
    const { data, conteudo } = req.body;
    const d = new Date(data);
    d.setUTCHours(0, 0, 0, 0);

    const entrada = await Diario.findOneAndUpdate(
      { data: d, usuarioId: req.usuarioId },
      { conteudo, usuarioId: req.usuarioId },
      { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json(entrada);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao salvar entrada', detalhes: err.message });
  }
});

// PUT /diario/:id
router.put('/:id', async (req, res) => {
  try {
    const atualizado = await Diario.findOneAndUpdate(
      { _id: req.params.id, usuarioId: req.usuarioId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!atualizado) return res.status(404).json({ erro: 'Entrada não encontrada' });
    res.json(atualizado);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao atualizar entrada', detalhes: err.message });
  }
});

module.exports = router;
