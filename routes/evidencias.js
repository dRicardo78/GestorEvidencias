// routes/evidencias.js
// Rutas API para gestión de evidencias con relación a estudiantes

const express = require('express');
const router = express.Router();
const Evidencia = require('../models/Evidencia');
const Estudiante = require('../models/Estudiante');

// GET - Obtener todas las evidencias
router.get('/', async (req, res, next) => {
  try {
    const { estudiante, tipo, estado } = req.query;
    const filtros = {};

    if (estudiante) filtros.estudiante = estudiante;
    if (tipo) filtros.tipo = tipo;
    if (estado) filtros.estado = estado;

    const evidencias = await Evidencia.find(filtros)
      .populate('estudiante', 'codigo nombre correo programa semestre')
      .sort({ fechaCarga: -1 });

    res.json(evidencias);
  } catch (error) {
    next(error);
  }
});

// GET - Obtener evidencia por ID
router.get('/:id', async (req, res, next) => {
  try {
    const evidencia = await Evidencia.findById(req.params.id)
      .populate('estudiante', 'codigo nombre correo programa semestre');

    if (!evidencia) {
      return res.status(404).json({ error: 'Evidencia no encontrada' });
    }

    res.json(evidencia);
  } catch (error) {
    next(error);
  }
});

// POST - Crear nueva evidencia
router.post('/', async (req, res, next) => {
  try {
    const { estudiante, tipo, nombre, descripcion, archivo } = req.body;

    // Validación de campos obligatorios
    if (!estudiante || !tipo || !nombre || !descripcion) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios: estudiante, tipo, nombre, descripcion',
      });
    }

    // Verificar que el estudiante existe
    const estudianteExistente = await Estudiante.findById(estudiante);
    if (!estudianteExistente) {
      return res.status(400).json({
        error: 'El estudiante especificado no existe'
      });
    }

    const nuevaEvidencia = new Evidencia({
      estudiante,
      tipo,
      nombre,
      descripcion,
      archivo: archivo || null,
    });

    const evidenciaGuardada = await nuevaEvidencia.save();

    // Poblar datos del estudiante antes de devolver
    await evidenciaGuardada.populate('estudiante', 'codigo nombre correo programa semestre');

    res.status(201).json(evidenciaGuardada);
  } catch (error) {
    next(error);
  }
});

// PUT - Actualizar evidencia
router.put('/:id', async (req, res, next) => {
  try {
    const { estudiante, tipo, nombre, descripcion, archivo, estado, calificacion, observaciones } = req.body;

    // Si se intenta cambiar estudiante, verificar que existe
    if (estudiante) {
      const estudianteExistente = await Estudiante.findById(estudiante);
      if (!estudianteExistente) {
        return res.status(400).json({
          error: 'El estudiante especificado no existe'
        });
      }
    }

    const updateData = {};
    if (estudiante !== undefined) updateData.estudiante = estudiante;
    if (tipo !== undefined) updateData.tipo = tipo;
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (archivo !== undefined) updateData.archivo = archivo;
    if (estado !== undefined) updateData.estado = estado;
    if (calificacion !== undefined) updateData.calificacion = calificacion;
    if (observaciones !== undefined) updateData.observacionTutor = observaciones;

    const evidenciaActualizada = await Evidencia.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('estudiante', 'codigo nombre correo programa semestre');

    if (!evidenciaActualizada) {
      return res.status(404).json({ error: 'Evidencia no encontrada' });
    }

    res.json(evidenciaActualizada);
  } catch (error) {
    next(error);
  }
});

// DELETE - Eliminar evidencia
router.delete('/:id', async (req, res, next) => {
  try {
    const evidenciaEliminada = await Evidencia.findByIdAndDelete(req.params.id);

    if (!evidenciaEliminada) {
      return res.status(404).json({ error: 'Evidencia no encontrada' });
    }

    res.json({
      mensaje: 'Evidencia eliminada correctamente',
      evidencia: evidenciaEliminada
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
