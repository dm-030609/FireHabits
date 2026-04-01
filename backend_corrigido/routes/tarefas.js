const express = require('express');
const router = express.Router();
const Tarefa = require('../models/tarefa');

// GET /tarefas — listar tarefas (filtro por status opcional)
router.get('/', async (req, res, next) => {
  try {
    const filtro = {};
    if (req.query.status) filtro.status = req.query.status;
    const tarefas = await Tarefa.find(filtro).sort({ createdAt: -1 }).lean();
    res.json(tarefas);
  } catch (err) { next(err); }
});

// POST /tarefas — criar tarefa
router.post('/', async (req, res, next) => {
  try {
    const { titulo, descricao, prioridade, usuarioId } = req.body;
    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ erro: 'Titulo e obrigatorio' });
    }
    const tarefa = await Tarefa.create({ titulo, descricao, prioridade, usuarioId });
    res.status(201).json(tarefa);
  } catch (err) { next(err); }
});

// PUT /tarefas/:id — atualizar tarefa
router.put('/:id', async (req, res, next) => {
  try {
    const update = { ...req.body };
    if (update.status === 'concluida' && !update.concluidaEm) {
      update.concluidaEm = new Date();
    }
    const tarefa = await Tarefa.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).lean();
    if (!tarefa) return res.status(404).json({ erro: 'Tarefa nao encontrada' });
    res.json(tarefa);
  } catch (err) { next(err); }
});

// DELETE /tarefas/:id — excluir permanentemente
router.delete('/:id', async (req, res, next) => {
  try {
    const r = await Tarefa.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ erro: 'Tarefa nao encontrada' });
    res.sendStatus(204);
  } catch (err) { next(err); }
});

module.exports = router;
