const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const Usuario = require('../models/usuario');

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function gerarToken(usuarioId) {
  return jwt.sign({ usuarioId: String(usuarioId) }, JWT_SECRET, { expiresIn: '30d' });
}

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'Email e senha são obrigatórios' });

    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(409).json({ erro: 'Email já cadastrado' });

    const senhaHash = await bcrypt.hash(senha, 12);
    const usuario = await Usuario.create({ nome, email, senhaHash });
    const token = gerarToken(usuario._id);

    res.status(201).json({ token, usuario: { _id: usuario._id, nome: usuario.nome, email: usuario.email } });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao registrar', detalhes: err.message });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'Email e senha são obrigatórios' });

    const usuario = await Usuario.findOne({ email });
    if (!usuario || !usuario.senhaHash) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const ok = await bcrypt.compare(senha, usuario.senhaHash);
    if (!ok) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const token = gerarToken(usuario._id);
    res.json({ token, usuario: { _id: usuario._id, nome: usuario.nome, email: usuario.email, avatar: usuario.avatar } });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao fazer login', detalhes: err.message });
  }
});

// POST /auth/google
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ erro: 'idToken é obrigatório' });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name: nome, picture: avatar } = payload;

    let usuario = await Usuario.findOne({ $or: [{ googleId }, { email }] });
    if (!usuario) {
      usuario = await Usuario.create({ googleId, email, nome, avatar });
    } else if (!usuario.googleId) {
      usuario.googleId = googleId;
      if (avatar) usuario.avatar = avatar;
      await usuario.save();
    }

    const token = gerarToken(usuario._id);
    res.json({ token, usuario: { _id: usuario._id, nome: usuario.nome, email: usuario.email, avatar: usuario.avatar } });
  } catch (err) {
    res.status(401).json({ erro: 'Token Google inválido', detalhes: err.message });
  }
});

module.exports = router;
