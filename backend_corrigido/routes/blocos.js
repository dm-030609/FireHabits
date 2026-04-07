const express = require('express');
const router = express.Router();
const Bloco = require('../models/bloco');

// GET /blocos — listar todos os blocos da semana
router.get('/', async (req, res, next) => {
  try {
    const filtro = {};
    if (req.query.diaSemana !== undefined) filtro.diaSemana = Number(req.query.diaSemana);
    const blocos = await Bloco.find(filtro).sort({ diaSemana: 1, horaInicio: 1 }).lean();
    res.json(blocos);
  } catch (err) { next(err); }
});

// POST /blocos — criar bloco
router.post('/', async (req, res, next) => {
  try {
    const { titulo, diaSemana, dataEspecifica, horaInicio, horaFim, categoria, cor, usuarioId } = req.body;
    if (!titulo || (!horaInicio) || (!horaFim)) {
      return res.status(400).json({ erro: 'titulo, horaInicio e horaFim sao obrigatorios' });
    }
    if (diaSemana === undefined && !dataEspecifica) {
      return res.status(400).json({ erro: 'Informe diaSemana (recorrente) ou dataEspecifica (avulso)' });
    }
    const bloco = await Bloco.create({
      titulo, horaInicio, horaFim, categoria, cor, usuarioId,
      diaSemana: dataEspecifica ? null : diaSemana,
      dataEspecifica: dataEspecifica || null,
    });
    res.status(201).json(bloco);
  } catch (err) { next(err); }
});

// PUT /blocos/:id — atualizar bloco
router.put('/:id', async (req, res, next) => {
  try {
    const bloco = await Bloco.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!bloco) return res.status(404).json({ erro: 'Bloco nao encontrado' });
    res.json(bloco);
  } catch (err) { next(err); }
});

// DELETE /blocos/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const r = await Bloco.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ erro: 'Bloco nao encontrado' });
    res.sendStatus(204);
  } catch (err) { next(err); }
});

module.exports = router;
