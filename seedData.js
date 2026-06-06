// seedData.js — ejecutar UNA vez: node seedData.js
require('dotenv').config();
const mongoose = require('mongoose');
const Estudiante = require('./models/Estudiante');
const Evidencia  = require('./models/Evidencia');
const Observacion = require('./models/Observacion');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado. Limpiando colecciones...');
  await Promise.all([Estudiante.deleteMany(), Evidencia.deleteMany(), Observacion.deleteMany()]);

  const estudiantes = await Estudiante.insertMany([
    { codigo:'IS-001', nombre:'Ana María Torres',    correo:'ana.torres@edu.co',    programa:'Ingeniería de Sistemas',    semestre:3 },
    { codigo:'IS-002', nombre:'Carlos Mendoza',       correo:'c.mendoza@edu.co',     programa:'Ingeniería de Sistemas',    semestre:5 },
    { codigo:'AE-001', nombre:'Laura Gómez Ruiz',     correo:'l.gomez@edu.co',       programa:'Administración de Empresas',semestre:4 },
    { codigo:'AE-002', nombre:'Pedro Jiménez',        correo:'p.jimenez@edu.co',     programa:'Administración de Empresas',semestre:2 },
    { codigo:'CO-001', nombre:'Sandra Rincón',        correo:'s.rincon@edu.co',      programa:'Contabilidad',              semestre:6 },
    { codigo:'CO-002', nombre:'Miguel Herrera',       correo:'m.herrera@edu.co',     programa:'Contabilidad',              semestre:1 },
  ]);

  const evidencias = await Evidencia.insertMany([
    { estudiante:estudiantes[0]._id, tipo:'Informe',   nombre:'Informe Redes I',        descripcion:'Análisis de protocolos TCP/IP',  estado:'Revisado',    calificacion:4.5, profesor:'Prof. García',   fechaCarga:new Date('2026-03-10'), fechaCalificacion:new Date('2026-03-20') },
    { estudiante:estudiantes[0]._id, tipo:'Proyecto',  nombre:'Proyecto BD',            descripcion:'Diseño modelo relacional',        estado:'Sin revisar', calificacion:null,profesor:null,            fechaCarga:new Date('2026-04-05') },
    { estudiante:estudiantes[1]._id, tipo:'Bitácora',  nombre:'Bitácora Semana 1',      descripcion:'Seguimiento actividades',         estado:'Sin revisar', calificacion:null,profesor:null,            fechaCarga:new Date('2026-04-12') },
    { estudiante:estudiantes[2]._id, tipo:'Informe',   nombre:'Análisis Mercado',       descripcion:'Estudio de mercado regional',     estado:'Revisado',    calificacion:3.8, profesor:'Prof. López',    fechaCarga:new Date('2026-03-18'), fechaCalificacion:new Date('2026-03-25') },
    { estudiante:estudiantes[3]._id, tipo:'Proyecto',  nombre:'Plan de Negocio',        descripcion:'Propuesta emprendimiento',        estado:'Sin revisar', calificacion:null,profesor:null,            fechaCarga:new Date('2026-04-20') },
    { estudiante:estudiantes[4]._id, tipo:'Informe',   nombre:'Informe Tributario',     descripcion:'Análisis impuesto de renta',      estado:'Revisado',    calificacion:4.2, profesor:'Prof. Ramírez',  fechaCarga:new Date('2026-03-22'), fechaCalificacion:new Date('2026-04-01') },
  ]);

  await Observacion.insertMany([
    { estudiante:estudiantes[0]._id, comentario:'Excelente desempeño, muy participativa en clases.',  fecha:new Date('2026-03-15') },
    { estudiante:estudiantes[0]._id, comentario:'Necesita mejorar entrega de informes a tiempo.',      fecha:new Date('2026-04-10') },
    { estudiante:estudiantes[1]._id, comentario:'Buen manejo de herramientas de programación.',        fecha:new Date('2026-03-28') },
    { estudiante:estudiantes[2]._id, comentario:'Proactiva y con iniciativa en proyectos grupales.',   fecha:new Date('2026-04-05') },
    { estudiante:estudiantes[4]._id, comentario:'Dominio sólido de los temas contables del semestre.', fecha:new Date('2026-04-08') },
  ]);

  console.log(`✅ Seed completado:
  - ${estudiantes.length} estudiantes
  - ${evidencias.length} evidencias
  - 5 observaciones`);
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });