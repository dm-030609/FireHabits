const express = require('express');
const router = express.Router();
const Registro = require('../models/registro.js');
const Habito = require('../models/habito.js');

router.get('/semana', async (req, res) => {
  try {
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());

    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);

    const habitos = await Habito.find();
    const registros = await Registro.find({
      data: { $gte: inicioSemana, $lte: fimSemana },
      valor: true
    });

    const retorno = habitos.map(habito => {
      const dias = Array(7).fill(false);
      registros
        .filter(r => r.habitoId.toString() === habito._id.toString())
        .forEach(r => {
          const dia = new Date(r.data).getDay();
          dias[dia] = true;
        });

      return {
        habitoId: habito._id,
        nome: habito.nome,
        progresso: dias
      };
    });

    res.json(retorno);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar progresso semanal' });
  }
});

module.exports = router;
