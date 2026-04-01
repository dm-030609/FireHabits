const mongoose = require('mongoose');

function toUTCDateOnly(d) {
  const date = new Date(d || Date.now());
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

const diarioSchema = new mongoose.Schema({
  data:       { type: Date, required: true },
  conteudo:   { type: String, required: true, trim: true },
  usuarioId:  { type: mongoose.Schema.Types.ObjectId, ref: 'usuario', index: true },
}, { timestamps: true });

// Uma entrada por dia (por usuário, quando implementado)
diarioSchema.index({ data: 1, usuarioId: 1 }, { unique: true });

diarioSchema.pre('validate', function(next) {
  if (this.data) this.data = toUTCDateOnly(this.data);
  next();
});

diarioSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() || {};
  if (update.data) update.data = toUTCDateOnly(update.data);
  this.setUpdate(update);
  next();
});

module.exports = mongoose.models.diario || mongoose.model('diario', diarioSchema);
