const express = require('express');
const router = express.Router();
const Habito = require('../models/habito');
const Registro = require('../models/registro');



// Rota para listar os hábitos
router.get('/', async (req, res) => {
  try {
    const habitos = await Habito.find();
    res.json(habitos);
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
router.post('/', async (req, res) => {
    try{
        const novoHabito = new Habito(req.body);
        await novoHabito.save();
        res.status(201).json(novoHabito);
    } catch (err) {
        res.status(400).json({ erro: "Erro ao criar hábito", detalhes: err});
    }
});


//  atualizar hábito
router.put("/:id", async (req, res) => {
    try {
        const atualizado = await Habito.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if(!atualizado) return res.status(404).json({ erro: "Hábito não encontrado", detalhes: err});
        
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
        ress.status(400).json({ erro: "Erro ao atualizar hábito", detalhes: err});
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