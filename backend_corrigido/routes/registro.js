// backend_corrigido/routes/registro.js
const express = require('express');
const router = express.Router();
const Registro = require('../models/registro.js');

// Helpers (opcional, caso queira normalizar aqui também)
const toUTCDateOnly = (d) => {
  const x = new Date(d || Date.now());
  return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()));
};

// POST /registro  -> upsert idempotente por (habitoId, data)
router.post('/', async (req, res, next) => {
  try {
    const { habitoId, usuarioId, valor = true, nota, comentario } = req.body || {};
    let { data } = req.body || {};
    if (!habitoId) return res.status(400).json({ erro: 'habitoId é obrigatório' });

    data = toUTCDateOnly(data);

    const doc = await Registro.findOneAndUpdate(
      { habitoId, data },
      { $set: { habitoId, data, usuarioId, valor, nota, comentario } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(201).json(doc);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: 'Registro duplicado para esse dia' });
    return next(err);
  }
});

// GET /registro?habitoId=&usuarioId=&ini=YYYY-MM-DD&fim=YYYY-MM-DD
router.get('/', async (req, res, next) => {
  try {
    const q = {};
    if (req.query.habitoId)  q.habitoId  = req.query.habitoId;
    if (req.query.usuarioId) q.usuarioId = req.query.usuarioId;

    if (req.query.ini || req.query.fim) {
      q.data = {};
      if (req.query.ini) q.data.$gte = toUTCDateOnly(req.query.ini);
      if (req.query.fim) q.data.$lte = toUTCDateOnly(req.query.fim);
    }

    const docs = await Registro.find(q).lean();
    res.json(docs);
  } catch (err) { next(err); }
});

// GET /registro/:id
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await Registro.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ erro: 'Registro não encontrado' });
    res.json(doc);
  } catch (err) { next(err); }
});

// PUT /registro/:id
router.put('/:id', async (req, res, next) => {
  try {
    const update = { ...req.body };
    if (update.data) update.data = toUTCDateOnly(update.data);

    const doc = await Registro.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).lean();

    if (!doc) return res.status(404).json({ erro: 'Registro não encontrado' });
    res.json(doc);
  } catch (err) { next(err); }
});

// DELETE /registro/by-day  { habitoId, data: 'YYYY-MM-DD' }
router.delete('/by-day', async (req, res, next) => {
  try {
    const { habitoId, data } = req.body || {};
    if (!habitoId || !data) {
      return res.status(400).json({ erro: 'habitoId e data são obrigatórios' });
    }

    // início e fim do dia em UTC
    const d = new Date(data);
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const end   = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1));

    const r = await Registro.findOneAndDelete({
      habitoId,
      data: { $gte: start, $lt: end }
    });

    if (!r) {
      return res.status(404).json({ erro: 'Registro do dia não encontrado' });
    }

    return res.sendStatus(204);
  } catch (err) {
    return next(err);
  }
});

// DEPOIS disso vem o DELETE /:id
router.delete('/:id', async (req, res, next) => {
  try {
    const r = await Registro.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ erro: 'Registro não encontrado' });
    res.sendStatus(204);
  } catch (err) { next(err); }
});

module.exports = router;
