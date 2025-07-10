const express = require('express');
const router = express.Router();
const Categoria = require('../models/Categoria');

//  criar Usuário
router.post('/', async (req, res) => {
    try{
        const novaCategoria = new Habito(req.body);
        await novaCategoria.save();
        res.status(201).json(novaCategoria);
    } catch (err) {
        res.status(400).json({ erro: "Erro ao criar categoria", detalhes: err});
    }
});

//  buscar por ID
router.get("/:id", async (req, res) => {
    try {
        const usuario = await Categoria.findById(req.params.id);
        if(!usuario) return res.status(404).json({ erro: "Categoria não encontrada"});
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar categoria"});
    }
});


//  atualizar categoria
router.put("/:id", async (req, res) => {
    try {
        const atualizado = await Cantegoria.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if(!atualizado) return res.status(404).json({ erro: "Categoria não encontrada", detalhes: err});
        res.json(atualizado);
    } catch (err) {
        ress.status(400).json({ erro: "Erro ao atualizar categoria", detalhes: err});
    }
});

//  Deletar categoria
router.delete('/:id', async (req, res) => {
  try {
    const deletado = await Categoria.findByIdAndDelete(req.params.id);
    if (!deletado) return res.status(404).json({ erro: 'Categoria não encontrada' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao deletar categoria' });
  }
});

module.exports = router;