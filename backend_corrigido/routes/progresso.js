const express = require('express');
const router = express.Router();
const Registro = require('../models/registro.js');
const Habito = require('../models/habito.js');
const auth = require('../middlewares/auth');

router.use(auth);

function startOfDayUTC(d) {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function addDaysUTC(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function startOfISOWeekUTC(date) {
  const d = startOfDayUTC(date);
  const day = d.getUTCDay();
  const diffToMonday = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  return d;
}

router.get('/semana', async (req, res) => {
  try {
    const hoje = new Date();
    const inicioSemana = startOfISOWeekUTC(hoje);
    const fimSemana = addDaysUTC(inicioSemana, 6);
    fimSemana.setUTCHours(23, 59, 59, 999);

    const datasArray = [];
    for (let i = 0; i < 7; i++) {
      const d = addDaysUTC(inicioSemana, i);
      datasArray.push(d.toISOString().slice(0, 10));
    }

    const habitos = await Habito.find({ usuarioId: req.usuarioId }).lean();
    if (habitos.length === 0) return res.json({ datas: datasArray, habitos: [] });

    const habitoIds = habitos.map((h) => h._id);

    const registrosSemana = await Registro.find({
      habitoId: { $in: habitoIds },
      usuarioId: req.usuarioId,
      valor: true,
      data: { $gte: inicioSemana, $lte: fimSemana }
    }).lean();

    const progressoPorHabito = {};
    habitos.forEach((h) => {
      progressoPorHabito[h._id] = {
        habitoId: h._id,
        nome: h.nome,
        tipo: h.tipo || 'Construtivo',
        progresso: Array(7).fill(false),
        semanal: 0,
        total: 0,
      };
    });

    registrosSemana.forEach((reg) => {
      const hId = reg.habitoId.toString();
      const dia = startOfDayUTC(reg.data);
      const diff = Math.floor((dia.getTime() - inicioSemana.getTime()) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 7) {
        progressoPorHabito[hId].progresso[diff] = true;
      }
    });

    Object.values(progressoPorHabito).forEach((h) => {
      h.semanal = h.progresso.filter(Boolean).length;
    });

    for (let h of habitos) {
      const total = await Registro.countDocuments({ habitoId: h._id, usuarioId: req.usuarioId, valor: true });
      progressoPorHabito[h._id].total = total;
    }

    return res.json({ datas: datasArray, habitos: Object.values(progressoPorHabito) });
  } catch (err) {
    console.error('❌ Erro em GET /progresso/semana:', err);
    res.status(500).json({ erro: 'Erro ao calcular progresso semanal' });
  }
});

module.exports = router;
