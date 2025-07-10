const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
  nome: String,
  cor: String,
  icone: String,
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
});

module.exports = mongoose.model('Categoria', categoriaSchema);
