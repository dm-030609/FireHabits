const express = require('express');
const router = express.Router();
const Tarefa = require('../models/tarefa');
const auth = require('../middlewares/auth');

router.use(auth);

// GET /tarefas
router.get('/', async (req, res, next) => {
  try {
    const filtro = { usuarioId: req.usuarioId };
    if (req.query.status) filtro.status = req.query.status;
    const tarefas = await Tarefa.find(filtro).sort({ createdAt: -1 }).lean();
    res.json(tarefas);
  } catch (err) { next(err); }
});

// POST /tarefas
router.post('/', async (req, res, next) => {
  try {
    const { titulo, descricao, prioridade } = req.body;
    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ erro: 'Titulo e obrigatorio' });
    }
    const tarefa = await Tarefa.create({ titulo, descricao, prioridade, usuarioId: req.usuarioId });
    res.status(201).json(tarefa);
  } catch (err) { next(err); }
});

// PUT /tarefas/:id
router.put('/:id', async (req, res, next) => {
  try {
    const update = { ...req.body };
    if (update.status === 'concluida' && !update.concluidaEm) {
      update.concluidaEm = new Date();
    }
    const tarefa = await Tarefa.findOneAndUpdate(
      { _id: req.params.id, usuarioId: req.usuarioId },
      update,
      { new: true, runValidators: true }
    ).lean();
    if (!tarefa) return res.status(404).json({ erro: 'Tarefa nao encontrada' });
    res.json(tarefa);
  } catch (err) { next(err); }
});

// DELETE /tarefas/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const r = await Tarefa.findOneAndDelete({ _id: req.params.id, usuarioId: req.usuarioId });
    if (!r) return res.status(404).json({ erro: 'Tarefa nao encontrada' });
    res.sendStatus(204);
  } catch (err) { next(err); }
});

module.exports = router;
