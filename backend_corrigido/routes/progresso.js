const express = require("express");
const router = express.Router();
const Registro = require("../models/registro.js");
const Habito = require("../models/habito.js");

// ---------- Helpers de Datas ----------
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

// Segunda-feira como início da semana (ISO)
function startOfISOWeekUTC(date) {
  const d = startOfDayUTC(date);
  const day = d.getUTCDay(); // 0 = dom, 1 = seg...

  // Converte para: seg = 0, ter = 1, ... dom = 6
  const diffToMonday = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  return d;
}

// ---------- ROTA PRINCIPAL ----------
router.get("/semana", async (req, res) => {
  try {
    // 1) Descobrir semana atual (SEG–DOM)
    const hoje = new Date();
    const inicioSemana = startOfISOWeekUTC(hoje); // Segunda UTC
    const fimSemana = addDaysUTC(inicioSemana, 6);
    fimSemana.setUTCHours(23, 59, 59, 999);

    // Criar array de datas (7 dias)
    const datasArray = [];
    for (let i = 0; i < 7; i++) {
      const d = addDaysUTC(inicioSemana, i);
      datasArray.push(d.toISOString().slice(0, 10));
    }

    // 2) Buscar hábitos (ativos)
    const habitos = await Habito.find().lean();

    if (habitos.length === 0) {
      return res.json({
        datas: datasArray,
        habitos: []
      });
    }

    const habitoIds = habitos.map((h) => h._id);

    // 3) Buscar registros da semana
    const registrosSemana = await Registro.find({
      habitoId: { $in: habitoIds },
      valor: true,
      data: { $gte: inicioSemana, $lte: fimSemana }
    }).lean();

    // Agrupar registros por hábito e por dia da semana (índice 0–6)
    const progressoPorHabito = {};

    habitos.forEach((h) => {
      progressoPorHabito[h._id] = {
        habitoId: h._id,
        nome: h.nome,
        progresso: Array(7).fill(false),
        semanal: 0,
        total: 0, // preenchido depois
      };
    });

    // 4) Preencher progresso semanal
    registrosSemana.forEach((reg) => {
      const hId = reg.habitoId.toString();

      const dia = startOfDayUTC(reg.data);
      const diff = Math.floor(
        (dia.getTime() - inicioSemana.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diff >= 0 && diff < 7) {
        progressoPorHabito[hId].progresso[diff] = true;
      }
    });

    // Calcular semanal (quantos true)
    Object.values(progressoPorHabito).forEach((h) => {
      h.semanal = h.progresso.filter((x) => x === true).length;
    });

    // 5) Buscar total histórico (para gamificação)
    // Uma consulta por hábito (poderia otimizar com aggregation, mas fica mais claro assim)
    for (let h of habitos) {
      const total = await Registro.countDocuments({
        habitoId: h._id,
        valor: true,
      });

      progressoPorHabito[h._id].total = total;
    }

    // 6) Resposta final
    const resposta = {
      datas: datasArray,
      habitos: Object.values(progressoPorHabito),
    };

    return res.json(resposta);
  } catch (err) {
    console.error("❌ Erro em GET /progresso/semana:", err);
    res.status(500).json({ erro: "Erro ao calcular progresso semanal" });
  }
});

module.exports = router;
