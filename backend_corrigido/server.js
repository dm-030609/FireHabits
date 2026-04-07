require('dotenv').config();

// Core & segurança
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');

const app = express();

// Middlewares básicos
app.use(express.json());
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(compression());

// CORS restrito por variável de ambiente (pode ser lista separada por vírgula)
// Suporta wildcards como *.vercel.app
const allowed = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

function isOriginAllowed(origin) {
  return allowed.some(pattern => {
    if (pattern === '*') return true;
    if (pattern.startsWith('*.')) {
      const suffix = pattern.slice(1); // ex: .vercel.app
      return origin.endsWith(suffix);
    }
    return pattern === origin;
  });
}

app.use(cors({
  origin(origin, cb) {
    // Permite ferramentas sem origin (ex: mobile, Postman, DevTools)
    if (!origin) return cb(null, true);

    if (isOriginAllowed(origin)) {
      return cb(null, true);
    } else {
      return cb(new Error("CORS bloqueado: origem não permitida → " + origin), false);
    }
  },
  credentials: true
}));


// Models (mantém como estavam)
const Usuario = require('./models/usuario.js');
const Habito   = require('./models/habito.js');
const Registro = require('./models/registro.js');
const Categoria= require('./models/categoria.js');

// Rotas
const authRouter     = require('./routes/auth.js');
const progressoRouter = require('./routes/progresso.js');
const habitosRoutes   = require('./routes/habitos.js');
const registroRouter = require('./routes/registro.js');
const diarioRouter   = require('./routes/diario.js');
const tarefasRouter  = require('./routes/tarefas.js');
const blocosRouter   = require('./routes/blocos.js');

app.use('/auth',      authRouter);
app.use('/progresso', progressoRouter);
app.use('/habitos',   habitosRoutes);
app.use('/registro', registroRouter);
app.use('/diario',   diarioRouter);
app.use('/tarefas',  tarefasRouter);
app.use('/blocos',   blocosRouter);

// Healthcheck pro Render/Netlify
app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

app.get('/healthz', (_req, res) => res.status(200).json({ ok: true, ts: Date.now() }));


// ===== MongoDB Atlas por ENV =====
const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('❌ MONGODB_URI não definido. Configure a variável de ambiente.');
  process.exit(1);
}

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => {
    console.error('❌ Erro ao conectar no MongoDB:', err.message);
    process.exit(1);
  });

// Porta dinâmica para Render/Heroku/etc.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API ouvindo em :${PORT}`);
});
