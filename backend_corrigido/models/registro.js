// const mongoose = require('mongoose');

// const registroSchema = new mongoose.Schema({
//   habitoId: { type: mongoose.Schema.Types.ObjectId, ref: 'habito' },
//   usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'usuario' },
//   data: { type: Date, default: Date.now },
//   valor: Boolean, // se foi feito ou não
//   nota: Number, // ex: de 1 a 5
//   comentario: String
// });

// //module.exports = mongoose.model('Registro', registroSchema);
// module.exports = mongoose.models.Registro || mongoose.model('registro', registroSchema);

// backend_corrigido/models/registro.js
const mongoose = require('mongoose');

function toUTCDateOnly(d) {
  const date = new Date(d || Date.now());
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

const registroSchema = new mongoose.Schema({
  habitoId:   { type: mongoose.Schema.Types.ObjectId, ref: 'habito', required: true, index: true },
  // usuarioId é opcional agora, mas já fica indexado para o futuro
  usuarioId:  { type: mongoose.Schema.Types.ObjectId, ref: 'usuario', index: true },
  data:       { type: Date, required: true },              // normalizada p/ 00:00 UTC
  valor:      { type: Boolean, default: true },            // concluído?
  nota:       { type: Number, min: 0, max: 10 },
  comentario: { type: String, trim: true }
}, { timestamps: true });

// Garante 1 registro por hábito por dia
registroSchema.index({ habitoId: 1, data: 1 }, { unique: true });

// Normaliza a data (qualquer hora -> 00:00 UTC) antes de salvar/atualizar
registroSchema.pre('validate', function(next) {
  if (this.data) this.data = toUTCDateOnly(this.data);
  next();
});
registroSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() || {};
  if (update.data) update.data = toUTCDateOnly(update.data);
  this.setUpdate(update);
  next();
});

module.exports = mongoose.models.registro || mongoose.model('registro', registroSchema);
