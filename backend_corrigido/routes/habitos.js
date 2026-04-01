const express = require('express');
const router = express.Router();
const Habito = require('../models/habito');
const Registro = require('../models/registro');



// Calcula streak de dias consecutivos para um hábito
async function calcularStreak(habitoId) {
  const registros = await Registro.find({
    habitoId,
    valor: true,
  }).sort({ data: -1 });

  if (registros.length === 0) return 0;

  const hoje = new Date();
  hoje.setUTCHours(0, 0, 0, 0);

  const ontem = new Date(hoje);
  ontem.setUTCDate(ontem.getUTCDate() - 1);

  const primeiraData = new Date(registros[0].data);
  primeiraData.setUTCHours(0, 0, 0, 0);

  // Streak só conta se o último registro é hoje ou ontem
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
    if (diffDias === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Rota para listar os hábitos (com streak)
router.get('/', async (req, res) => {
  try {
    const habitos = await Habito.find();
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

// Buscar um hábito pelo ID
router.get('/:id', async (req, res) => {
  try {
    const habito = await Habito.findById(req.params.id);
    if (!habito) {
      return res.status(404).json({ mensagem: 'Hábito não encontrado' });
    }
    res.json(habito);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});


//  criar hábito
router.post("/", async (req, res) => {
  try {
    const dados = req.body;

    // garante que o _id seja usado
    const novoHabito = new Habito({
      _id: dados._id,
      nome: dados.nome,
      descricao: dados.descricao,
      frequencia: dados.frequencia,
      tipo: dados.tipo,
      status: dados.status,
      criadoEm: dados.criadoEm
    });

    await novoHabito.save();
    res.status(201).json(novoHabito);
  } catch (err) {
    console.error("❌ Erro ao criar hábito:", err.message);
    res.status(500).json({ erro: "Erro ao criar hábito" });
  }
});


//  atualizar hábito
router.put("/:id", async (req, res) => {
  console.log('🚀 Dados recebidos no PUT:', req.body);
  try {
    const atualizado = await Habito.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!atualizado) return res.status(404).json({ erro: "Hábito não encontrado", detalhes: err });

    // Se marcado como concluído, salva um registro
    if (req.body.status === 'Concluído') {
      const novoRegistro = new Registro({
        habitoId: req.params.id,
        data: new Date(),
        valor: true, // ou concluido
      });
      await novoRegistro.save();
    }

    res.json(atualizado);
  } catch (err) {
    res.status(400).json({ erro: "Erro ao atualizar hábito", detalhes: err });
  }
});

//  Deletar hábito
router.delete('/:id', async (req, res) => {
  try {
    const deletado = await Habito.findByIdAndDelete(req.params.id);
    if (!deletado) return res.status(404).json({ erro: 'Hábito não encontrado' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao deletar hábito' });
  }
});


router.get('/resumo', async (req, res) => {
  try {
    const habitos = await Habito.find();

    const ativos = habitos.length;
    const concluidosHoje = habitos.filter(h => h.status === 'Concluído' && h.updatedAt && new Date(h.updatedAt).toDateString() === new Date().toDateString()).length;
    const pendentes = habitos.filter(h => h.status === 'Pendente').length;

    const semana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dadosSemana = semana.map((dia, index) => ({
      dia,
      completados: Math.floor(Math.random() * 5), // substituir por dados reais no futuro
    }));

    res.json({ ativos, concluidosHoje, pendentes, semana: dadosSemana });
  } catch (err) {
    console.error('Erro ao gerar resumo:', err);
    res.status(500).json({ erro: 'Erro ao gerar resumo' });
  }
});

router.get('/progresso', async (req, res) => {
  try {
    const habitos = await Habito.find();
    const hoje = new Date();
    const semana = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(hoje.getDate() - (6 - i)); // últimos 7 dias
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const progresso = await Promise.all(
      habitos.map(async (habito) => {
        const registros = await Registro.find({
          habitoId: habito._id,
          data: { $gte: semana[0], $lte: semana[6] },
          valor: true, // concluído
        });

        const diasConcluidos = registros.map(r => r.data.toDateString());

        return {
          nome: habito.nome,
          dias: semana.map(d => ({
            data: d.toDateString(),
            concluido: diasConcluidos.includes(d.toDateString()),
          })),
        };
      })
    );

    res.json(progresso);
  } catch (err) {
    console.error('Erro ao buscar progresso:', err);
    res.status(500).json({ erro: 'Erro ao gerar progresso' });
  }
});




module.exports = router;