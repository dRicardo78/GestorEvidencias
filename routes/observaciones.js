// routes/observaciones.js
// Rutas API para gestión de observaciones pedagógicas con relación a estudiantes

const express = require('express');
const router = express.Router();
const Observacion = require('../models/Observacion');
const Estudiante = require('../models/Estudiante');

// GET - Obtener todas las observaciones
router.get('/', async (req, res, next) => {
  try {
    const { estudiante } = req.query;
    const filtros = {};

    if (estudiante) filtros.estudiante = estudiante;

    const observaciones = await Observacion.find(filtros)
      .populate('estudiante', 'codigo nombre correo programa semestre')
      .sort({ fecha: -1 });

    res.json(observaciones);
  } catch (error) {
    next(error);
  }
});

// GET - Obtener observación por ID
router.get('/:id', async (req, res, next) => {
  try {
    const observacion = await Observacion.findById(req.params.id)
      .populate('estudiante', 'codigo nombre correo programa semestre');

    if (!observacion) {
      return res.status(404).json({ error: 'Observación no encontrada' });
    }

    res.json(observacion);
  } catch (error) {
    next(error);
  }
});

// POST - Crear nueva observación
router.post('/', async (req, res, next) => {
  try {
    const { estudiante, comentario, asesor } = req.body;

    // Validación de campos obligatorios
    if (!estudiante || !comentario) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios: estudiante, comentario',
      });
    }

    // Verificar que el estudiante existe
    const estudianteExistente = await Estudiante.findById(estudiante);
    if (!estudianteExistente) {
      return res.status(400).json({
        error: 'El estudiante especificado no existe'
      });
    }

    const nuevaObservacion = new Observacion({
      estudiante,
      comentario,
      asesor: asesor || null,
    });

    const observacionGuardada = await nuevaObservacion.save();

    // Poblar datos del estudiante antes de devolver
    await observacionGuardada.populate('estudiante', 'codigo nombre correo programa semestre');

    res.status(201).json(observacionGuardada);
  } catch (error) {
    next(error);
  }
});

// PUT - Actualizar observación
router.put('/:id', async (req, res, next) => {
  try {
    const { comentario, asesor } = req.body;

    // Validación de campos
    if (!comentario) {
      return res.status(400).json({
        error: 'El comentario es obligatorio'
      });
    }

    const updateData = {
      comentario
    };

    if (asesor !== undefined) {
      updateData.asesor = asesor;
    }

    const observacionActualizada = await Observacion.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('estudiante', 'codigo nombre correo programa semestre');

    if (!observacionActualizada) {
      return res.status(404).json({ error: 'Observación no encontrada' });
    }

    res.json(observacionActualizada);
  } catch (error) {
    next(error);
  }
});

// DELETE - Eliminar observación
router.delete('/:id', async (req, res, next) => {
  try {
    const observacionEliminada = await Observacion.findByIdAndDelete(req.params.id);

    if (!observacionEliminada) {
      return res.status(404).json({ error: 'Observación no encontrada' });
    }

    res.json({
      mensaje: 'Observación eliminada correctamente',
      observacion: observacionEliminada,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
