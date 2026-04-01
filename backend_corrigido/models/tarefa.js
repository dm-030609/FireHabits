const mongoose = require('mongoose');

const tarefaSchema = new mongoose.Schema({
  titulo: { type: String, required: true, trim: true },
  descricao: { type: String, trim: true },
  status: { type: String, enum: ['pendente', 'concluida', 'lixeira'], default: 'pendente' },
  prioridade: { type: String, enum: ['baixa', 'media', 'alta'], default: 'media' },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'usuario', index: true },
  concluidaEm: { type: Date },
}, { timestamps: true });

module.exports = mongoose.models.tarefa || mongoose.model('tarefa', tarefaSchema);
