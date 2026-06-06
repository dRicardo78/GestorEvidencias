// routes/estudiantes.js
// Rutas API para gestión de estudiantes con MongoDB

const express = require('express');
const router = express.Router();
const Estudiante = require('../models/Estudiante');
const Evidencia = require('../models/Evidencia');
const Observacion = require('../models/Observacion');

// GET - Obtener todos los estudiantes
router.get('/', async (req, res, next) => {
  try {
    const estudiantes = await Estudiante.find().sort({ nombre: 1 });
    res.json(estudiantes);
  } catch (error) {
    next(error);
  }
});

// GET - Obtener estudiante por ID
router.get('/:id', async (req, res, next) => {
  try {
    const estudiante = await Estudiante.findById(req.params.id);
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    res.json(estudiante);
  } catch (error) {
    next(error);
  }
});

// POST - Crear nuevo estudiante
router.post('/', async (req, res, next) => {
  try {
    const { codigo, nombre, correo, programa, semestre } = req.body;

    // Validación de campos obligatorios
    if (!codigo || !nombre || !correo || !programa || !semestre) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios: código, nombre, correo, programa, semestre'
      });
    }

    // Verificar código único
    const codigoExistente = await Estudiante.findOne({ codigo: codigo.toUpperCase() });
    if (codigoExistente) {
      return res.status(400).json({ error: 'El código ya está registrado' });
    }

    // Verificar correo único
    const correoExistente = await Estudiante.findOne({ correo: correo.toLowerCase() });
    if (correoExistente) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const nuevoEstudiante = new Estudiante({
      codigo,
      nombre,
      correo,
      programa,
      semestre
    });

    const estudianteGuardado = await nuevoEstudiante.save();
    res.status(201).json(estudianteGuardado);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'El código o correo ya existe en la base de datos'
      });
    }
    next(error);
  }
});

// PUT - Actualizar estudiante
router.put('/:id', async (req, res, next) => {
  try {
    const { codigo, nombre, correo, programa, semestre } = req.body;

    // Validación de campos
    if (!codigo || !nombre || !correo || !programa || !semestre) {
      return res.status(400).json({
        error: 'Todos los campos son obligatorios'
      });
    }

    // Verificar que el nuevo código no exista (si cambió)
    if (codigo) {
      const estudiante = await Estudiante.findById(req.params.id);
      if (estudiante && estudiante.codigo !== codigo.toUpperCase()) {
        const codigoExistente = await Estudiante.findOne({
          codigo: codigo.toUpperCase()
        });
        if (codigoExistente) {
          return res.status(400).json({ error: 'El código ya está registrado' });
        }
      }
    }

    const estudianteActualizado = await Estudiante.findByIdAndUpdate(
      req.params.id,
      {
        codigo,
        nombre,
        correo,
        programa,
        semestre
      },
      { new: true, runValidators: true }
    );

    if (!estudianteActualizado) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    res.json(estudianteActualizado);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'El código o correo ya existe en la base de datos'
      });
    }
    next(error);
  }
});

// DELETE - Eliminar estudiante (en cascada: elimina sus evidencias y observaciones)
router.delete('/:id', async (req, res, next) => {
  try {
    const estudianteEliminado = await Estudiante.findByIdAndDelete(req.params.id);

    if (!estudianteEliminado) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    // Eliminación en cascada
    const [evidenciasEliminadas, observacionesEliminadas] = await Promise.all([
      Evidencia.deleteMany({ estudiante: req.params.id }),
      Observacion.deleteMany({ estudiante: req.params.id }),
    ]);

    res.json({
      mensaje: 'Estudiante eliminado correctamente',
      estudiante: estudianteEliminado,
      evidenciasEliminadas: evidenciasEliminadas.deletedCount,
      observacionesEliminadas: observacionesEliminadas.deletedCount,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
