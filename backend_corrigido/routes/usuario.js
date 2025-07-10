const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

//  criar Usuário
router.post('/', async (req, res) => {
    try{
        const novoUsuario = new Habito(req.body);
        await novoUsuario.save();
        res.status(201).json(novoUsuario);
    } catch (err) {
        res.status(400).json({ erro: "Erro ao criar usuário", detalhes: err});
    }
});

//  buscar por ID
router.get("/:id", async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if(!usuario) return res.status(404).json({ erro: "Usuário não encontrado"});
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar usuário"});
    }
});


//  atualizar usuário
router.put("/:id", async (req, res) => {
    try {
        const atualizado = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if(!atualizado) return res.status(404).json({ erro: "Usuário não encontrado", detalhes: err});
        res.json(atualizado);
    } catch (err) {
        ress.status(400).json({ erro: "Erro ao atualizar usuário", detalhes: err});
    }
});

//  Deletar usuario
router.delete('/:id', async (req, res) => {
  try {
    const deletado = await Usuario.findByIdAndDelete(req.params.id);
    if (!deletado) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao deletar usuário' });
  }
});

module.exports = router;