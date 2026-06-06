// server.js
// Servidor principal - Express + MongoDB

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Importar rutas
const evidenciasRoutes = require('./routes/evidencias');
const estudiantesRoutes = require('./routes/estudiantes');
const observacionesRoutes = require('./routes/observaciones');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// ===== FRONTEND =====
// Servir archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

// ===== CONEXIÓN DB =====
connectDB();

// ===== RUTAS API =====
app.use('/api/evidencias', evidenciasRoutes);
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/observaciones', observacionesRoutes);

// ===== RUTA DE SALUD =====
app.get('/health', (req, res) => {
  res.json({
    status: '✅ Servidor funcionando',
    timestamp: new Date().toISOString(),
    ambiente: process.env.NODE_ENV,
    endpoints: [
      '/api/estudiantes',
      '/api/evidencias',
      '/api/observaciones'
    ]
  });
});

// ===== MANEJO DE ERRORES =====
app.use(errorHandler);

// ===== ARRANQUE SERVIDOR =====
app.listen(PORT, () => {
  const WIDTH = 46;
  const pad = (str) => {
    const visible = str.replace(/\uD83D[\uDE00-\uDE4F]|\uD83D[\uDE80-\uDEFF]/gu, '  ');
    const spaces = WIDTH - visible.length;
    return `║  ${str}${' '.repeat(Math.max(0, spaces - 2))}║`;
  };
  const line  = `╔${'═'.repeat(WIDTH)}╗`;
  const close = `╚${'═'.repeat(WIDTH)}╝`;
  console.log([
    '',
    line,
    pad('🚀 Servidor iniciado exitosamente'),
    pad(`Puerto:   ${PORT}`),
    pad(`Ambiente: ${process.env.NODE_ENV || 'development'}`),
    pad(`Acesso:    http://localhost:${PORT}`),
    close,
    '',
  ].join('\n'));
});

module.exports = app;
