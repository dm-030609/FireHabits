const mongoose = require('mongoose');

const habitoSchema = new mongoose.Schema({
  nome: String,
  descricao: String,
  frequencia: String, // Diário, Semanal, etc.
  status: { type: String, enum: ['Ativo', 'Inativo', 'Pendente'] },
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('habito', habitoSchema);
