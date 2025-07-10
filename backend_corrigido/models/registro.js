const mongoose = require('mongoose');

const registroSchema = new mongoose.Schema({
  habitoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habito' },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  data: { type: Date, default: Date.now },
  valor: Boolean, // se foi feito ou não
  nota: Number, // ex: de 1 a 5
  comentario: String
});

//module.exports = mongoose.model('Registro', registroSchema);
module.exports = mongoose.models.Registro || mongoose.model('Registro', registroSchema);

