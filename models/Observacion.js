// models/Observacion.js
// Esquema para observaciones pedagógicas con relación a estudiantes

const mongoose = require('mongoose');

const observacionSchema = new mongoose.Schema(
  {
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estudiante',
      required: [true, 'El estudiante es obligatorio'],
    },
    comentario: {
      type: String,
      required: [true, 'El comentario es obligatorio'],
      trim: true,
      maxlength: [500, 'Comentario máximo 500 caracteres'],
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
    asesor: {
      type: String,
      trim: true,
      maxlength: [150, 'Nombre del asesor máximo 150 caracteres'],
    },
  },
  {
    timestamps: true
  }
);

// Índice para búsquedas
observacionSchema.index({ estudiante: 1 });

module.exports = mongoose.model('Observacion', observacionSchema);