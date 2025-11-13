const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true, required: true },
  senhaHash: { type: String, required: true },
  criadoEm: { type: Date, default: Date.now },
  configuracoes: {
    notificacoes: { type: Boolean, default: true },
    tema: { type: String, default: 'dark' }
  }
});

module.exports = mongoose.model('usuario', usuarioSchema);
