// models/Evidencia.js
// Esquema de datos para Evidencias Académicas con relación a Estudiantes

const mongoose = require('mongoose');

const evidenciaSchema = new mongoose.Schema(
  {
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estudiante',
      required: [true, 'El estudiante es obligatorio'],
    },
    tipo: {
      type: String,
      enum: ['Informe', 'Proyecto', 'Bitácora'],
      required: [true, 'El tipo de evidencia es obligatorio'],
    },
    nombre: {
      type: String,
      required: [true, 'El nombre de la evidencia es obligatorio'],
      trim: true,
      maxlength: [200, 'Nombre máximo 200 caracteres'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      maxlength: [1000, 'Descripción máximo 1000 caracteres'],
    },
    fechaCarga: {
      type: Date,
      default: Date.now,
    },
    archivo: {
      nombre: String,
      url: String,
      tipo: String,
      tamaño: Number,
    },
    estado: {
      type: String,
      enum: ['Pendiente', 'Revisada', 'Aprobada', 'Rechazada'],
      default: 'Pendiente',
    },
    calificacion: {
      type: Number,
      min: [0, 'La calificación mínima es 0'],
      max: [5, 'La calificación máxima es 5'],
      default: null,
    },
    observacionTutor: {
      type: String,
      trim: true,
      maxlength: [1000, 'Observación del tutor máximo 1000 caracteres'],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para búsquedas
evidenciaSchema.index({ estudiante: 1, tipo: 1 });
evidenciaSchema.index({ nombre: 'text' });

module.exports = mongoose.model('Evidencia', evidenciaSchema);