const express = require('express');
const router = express.Router();
const Diario = require('../models/diario');

// Listar entradas (com filtro opcional por data)
router.get('/', async (req, res) => {
  try {
    const filtro = {};
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

// Criar ou atualizar entrada do dia (upsert)
router.post('/', async (req, res) => {
  try {
    const { data, conteudo, usuarioId } = req.body;
    const d = new Date(data);
    d.setUTCHours(0, 0, 0, 0);

    const entrada = await Diario.findOneAndUpdate(
      { data: d },
      { conteudo, usuarioId },
      { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json(entrada);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao salvar entrada', detalhes: err.message });
  }
});

// Atualizar entrada por ID
router.put('/:id', async (req, res) => {
  try {
    const atualizado = await Diario.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!atualizado) return res.status(404).json({ erro: 'Entrada não encontrada' });
    res.json(atualizado);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao atualizar entrada', detalhes: err.message });
  }
});

module.exports = router;
