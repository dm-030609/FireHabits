const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Registro = require('../models/registro.js');
const auth = require('../middlewares/auth');

router.use(auth);

const toUTCDateOnly = (d) => {
  const x = new Date(d || Date.now());
  return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()));
};

// POST /registro — upsert idempotente por (habitoId, data, usuarioId)
router.post('/', async (req, res, next) => {
  try {
    const { habitoId, valor = true, nota, comentario } = req.body || {};
    let { data } = req.body || {};
    if (!habitoId) return res.status(400).json({ erro: 'habitoId é obrigatório' });

    data = toUTCDateOnly(data);

    const doc = await Registro.findOneAndUpdate(
      { habitoId, data, usuarioId: req.usuarioId },
      { $set: { habitoId, data, usuarioId: req.usuarioId, valor, nota, comentario } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(201).json(doc);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: 'Registro duplicado para esse dia' });
    return next(err);
  }
});

// GET /registro
router.get('/', async (req, res, next) => {
  try {
    const q = { usuarioId: req.usuarioId };
    if (req.query.habitoId) q.habitoId = req.query.habitoId;

    if (req.query.ini || req.query.fim) {
      q.data = {};
      if (req.query.ini) q.data.$gte = toUTCDateOnly(req.query.ini);
      if (req.query.fim) q.data.$lte = toUTCDateOnly(req.query.fim);
    }

    const docs = await Registro.find(q).lean();
    res.json(docs);
  } catch (err) { next(err); }
});

// GET /registro/heatmap
router.get('/heatmap', async (req, res, next) => {
  try {
    const meses = parseInt(req.query.meses) || 12;
    const ini = new Date();
    ini.setUTCMonth(ini.getUTCMonth() - meses);
    ini.setUTCHours(0, 0, 0, 0);

    const matchStage = {
      valor: true,
      data: { $gte: ini },
      usuarioId: new mongoose.Types.ObjectId(req.usuarioId),
    };
    if (req.query.habitoId) {
      matchStage.habitoId = mongoose.Types.ObjectId.createFromHexString(req.query.habitoId);
    }

    const resultado = await Registro.aggregate([
      { $match: matchStage },
      { $group: { _id: '$data', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const heatmap = resultado.map((r) => ({
      data: r._id.toISOString().split('T')[0],
      count: r.count,
    }));

    res.json(heatmap);
  } catch (err) { next(err); }
});

// GET /registro/:id
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await Registro.findOne({ _id: req.params.id, usuarioId: req.usuarioId }).lean();
    if (!doc) return res.status(404).json({ erro: 'Registro não encontrado' });
    res.json(doc);
  } catch (err) { next(err); }
});

// PUT /registro/:id
router.put('/:id', async (req, res, next) => {
  try {
    const update = { ...req.body };
    if (update.data) update.data = toUTCDateOnly(update.data);

    const doc = await Registro.findOneAndUpdate(
      { _id: req.params.id, usuarioId: req.usuarioId },
      update,
      { new: true, runValidators: true }
    ).lean();

    if (!doc) return res.status(404).json({ erro: 'Registro não encontrado' });
    res.json(doc);
  } catch (err) { next(err); }
});

// DELETE /registro/by-day
router.delete('/by-day', async (req, res, next) => {
  try {
    const { habitoId, data } = req.body || {};
    if (!habitoId || !data) {
      return res.status(400).json({ erro: 'habitoId e data são obrigatórios' });
    }

    const d = new Date(data);
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1));

    const r = await Registro.findOneAndDelete({
      habitoId,
      usuarioId: req.usuarioId,
      data: { $gte: start, $lt: end }
    });

    if (!r) return res.status(404).json({ erro: 'Registro do dia não encontrado' });
    return res.sendStatus(204);
  } catch (err) { return next(err); }
});

// DELETE /registro/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const r = await Registro.findOneAndDelete({ _id: req.params.id, usuarioId: req.usuarioId });
    if (!r) return res.status(404).json({ erro: 'Registro não encontrado' });
    res.sendStatus(204);
  } catch (err) { next(err); }
});

module.exports = router;
