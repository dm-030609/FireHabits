const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
  nome: String,
  cor: String,
  icone: String,
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'usuario' }
});

module.exports = mongoose.model('categoria', categoriaSchema);
