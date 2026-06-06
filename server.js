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

// Middleware
app.use(express.json());
app.use(express.static('./'));  // Servir archivos estáticos (HTML, CSS, JS)
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Conectar a MongoDB
connectDB();

// Rutas API
app.use('/api/evidencias', evidenciasRoutes);
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/observaciones', observacionesRoutes);

// Ruta raíz para verificar que el servidor funciona
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

// Middleware de manejo de errores (debe ser el último)
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║  🚀 Servidor iniciado exitosamente      ║
║  Puerto: ${PORT}                           ║
║  Ambiente: ${process.env.NODE_ENV}                     ║
║  Verifica: http://localhost:${PORT}/health   ║
╚══════════════════════════════════════════╝
  `);
});

module.exports = app;
