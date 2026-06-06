// middleware/errorHandler.js
// Middleware para manejo centralizado de errores

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Error de validación',
      details: messages,
    });
  }

  // Error de duplicidad (ID único)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: `El ${field} ya existe`,
    });
  }

  // Error por defecto
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
  });
};

module.exports = errorHandler;
