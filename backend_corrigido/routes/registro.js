const express = require('express');
const router = express.Router();
const Registro = require('../models/registro');

//  criar Registro
router.post('/', async (req, res) => {
    try{
        const novoRegistro = new Registro(req.body);
        await novoRegistro.save();
        res.status(201).json(novoRegistro);
    } catch (err) {
        res.status(400).json({ erro: "Erro ao criar registro", detalhes: err});
    }
});

//  buscar por ID
router.get("/:id", async (req, res) => {
    try {
        const usuario = await Registro.findById(req.params.id);
        if(!usuario) return res.status(404).json({ erro: "Registro não encontrada"});
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar registro"});
    }
});


//  atualizar registro
router.put("/:id", async (req, res) => {
    try {
        const atualizado = await Registro.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if(!atualizado) return res.status(404).json({ erro: "Registro não encontrada", detalhes: err});
        res.json(atualizado);
    } catch (err) {
        ress.status(400).json({ erro: "Erro ao atualizar registro", detalhes: err});
    }
});

//  Deletar registro
router.delete('/:id', async (req, res) => {
  try {
    const deletado = await Registro.findByIdAndDelete(req.params.id);
    if (!deletado) return res.status(404).json({ erro: 'Registro não encontrada' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao deletar registro' });
  }
});

module.exports = router;