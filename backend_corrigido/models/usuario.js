const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true, required: true },
  senhaHash: { type: String }, // optional: Google users don't have one
  googleId: { type: String, unique: true, sparse: true },
  avatar: String,
  criadoEm: { type: Date, default: Date.now },
  configuracoes: {
    notificacoes: { type: Boolean, default: true },
    tema: { type: String, default: 'dark' }
  }
});

module.exports = mongoose.models.usuario || mongoose.model('usuario', usuarioSchema);
