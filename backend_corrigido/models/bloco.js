const mongoose = require('mongoose');

const blocoSchema = new mongoose.Schema({
  titulo: { type: String, required: true, trim: true },
  diaSemana: { type: Number, required: true, min: 0, max: 6 }, // 0=Dom, 6=Sab
  horaInicio: { type: String, required: true }, // "08:00"
  horaFim: { type: String, required: true },    // "09:30"
  categoria: {
    type: String,
    enum: ['deep-work', 'reuniao', 'treino', 'rotina', 'livre'],
    default: 'deep-work',
  },
  cor: { type: String, default: '#e60000' },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'usuario', index: true },
}, { timestamps: true });

blocoSchema.index({ diaSemana: 1, horaInicio: 1 });

module.exports = mongoose.models.bloco || mongoose.model('bloco', blocoSchema);
