const express = require('express');
const router = express.Router();
const Habito = require('../models/habito');
const Registro = require('../models/registro');
const auth = require('../middlewares/auth');

router.use(auth);

async function calcularStreak(habitoId) {
  const registros = await Registro.find({ habitoId, valor: true }).sort({ data: -1 });
  if (registros.length === 0) return 0;

  const hoje = new Date();
  hoje.setUTCHours(0, 0, 0, 0);
  const ontem = new Date(hoje);
  ontem.setUTCDate(ontem.getUTCDate() - 1);

  const primeiraData = new Date(registros[0].data);
  primeiraData.setUTCHours(0, 0, 0, 0);

  if (primeiraData.getTime() !== hoje.getTime() && primeiraData.getTime() !== ontem.getTime()) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < registros.length; i++) {
    const atual = new Date(registros[i - 1].data);
    atual.setUTCHours(0, 0, 0, 0);
    const anterior = new Date(registros[i].data);
    anterior.setUTCHours(0, 0, 0, 0);
    const diffDias = (atual.getTime() - anterior.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDias === 1) streak++;
    else break;
  }

  return streak;
}

// GET /habitos
router.get('/', async (req, res) => {
  try {
    const habitos = await Habito.find({ usuarioId: req.usuarioId });
    const habitosComStreak = await Promise.all(
      habitos.map(async (h) => {
        const streakAtual = await calcularStreak(h._id);
        return { ...h.toObject(), streakAtual };
      })
    );
    res.json(habitosComStreak);
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro ao buscar hábitos', erro: err });
  }
});

// GET /habitos/:id
router.get('/:id', async (req, res) => {
  try {
    const habito = await Habito.findOne({ _id: req.params.id, usuarioId: req.usuarioId });
    if (!habito) return res.status(404).json({ mensagem: 'Hábito não encontrado' });
    res.json(habito);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /habitos
router.post('/', async (req, res) => {
  try {
    const dados = req.body;
    const novoHabito = new Habito({
      _id: dados._id,
      nome: dados.nome,
      descricao: dados.descricao,
      frequencia: dados.frequencia,
      tipo: dados.tipo,
      status: dados.status,
      criadoEm: dados.criadoEm,
      usuarioId: req.usuarioId,
    });
    await novoHabito.save();
    res.status(201).json(novoHabito);
  } catch (err) {
    console.error('❌ Erro ao criar hábito:', err.message);
    res.status(500).json({ erro: 'Erro ao criar hábito' });
  }
});

// PUT /habitos/:id
router.put('/:id', async (req, res) => {
  try {
    const atualizado = await Habito.findOneAndUpdate(
      { _id: req.params.id, usuarioId: req.usuarioId },
      req.body,
      { new: true }
    );
    if (!atualizado) return res.status(404).json({ erro: 'Hábito não encontrado' });

    if (req.body.status === 'Concluído') {
      const novoRegistro = new Registro({
        habitoId: req.params.id,
        usuarioId: req.usuarioId,
        data: new Date(),
        valor: true,
      });
      await novoRegistro.save().catch(() => {}); // ignora duplicata do dia
    }

    res.json(atualizado);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao atualizar hábito', detalhes: err });
  }
});

// DELETE /habitos/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletado = await Habito.findOneAndDelete({ _id: req.params.id, usuarioId: req.usuarioId });
    if (!deletado) return res.status(404).json({ erro: 'Hábito não encontrado' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao deletar hábito' });
  }
});

module.exports = router;
