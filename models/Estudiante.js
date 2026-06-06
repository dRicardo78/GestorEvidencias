// models/Estudiante.js
// Esquema de datos para Estudiantes

const mongoose = require('mongoose');

const estudianteSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, 'El código del estudiante es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [150, 'Nombre máximo 150 caracteres'],
    },
    correo: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[\w.-]+@[\w.-]+\.\w+$/, 'Correo inválido'],
    },
    programa: {
      type: String,
      required: [true, 'El programa es obligatorio'],
      trim: true,
      enum: [
        'Ingeniería de Sistemas',
        'Administración de Empresas',
        'Contabilidad',
        'Otros'
      ],
    },
    semestre: {
      type: Number,
      required: [true, 'El semestre es obligatorio'],
      min: [1, 'Semestre mínimo 1'],
      max: [12, 'Semestre máximo 12'],
    },
  },
  {
    timestamps: true,
  }
);

// Índices para búsquedas
estudianteSchema.index({ codigo: 1 });
estudianteSchema.index({ correo: 1 });
estudianteSchema.index({ nombre: 'text' });

module.exports = mongoose.model('Estudiante', estudianteSchema);
