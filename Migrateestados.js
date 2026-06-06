// migrateEstados.js — ejecutar UNA vez para normalizar estados legacy
// node migrateEstados.js
require('dotenv').config();
const mongoose = require('mongoose');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado. Migrando estados...');

  const db = mongoose.connection.db;
  const col = db.collection('evidencias');

  // Mapear valores viejos a los nuevos
  const mappings = [
    { from: 'Revisada',  to: 'Revisado'    },
    { from: 'Aprobada',  to: 'Revisado'    },
    { from: 'Rechazada', to: 'Sin revisar' },
    { from: 'Pendiente', to: 'Sin revisar' },
  ];

  let total = 0;
  for (const { from, to } of mappings) {
    const r = await col.updateMany({ estado: from }, { $set: { estado: to } });
    if (r.modifiedCount > 0) {
      console.log(`  '${from}' → '${to}': ${r.modifiedCount} documento(s)`);
      total += r.modifiedCount;
    }
  }

  console.log(`\n✅ Migración completa: ${total} documento(s) actualizados`);
  await mongoose.disconnect();
}

migrate().catch(err => { console.error(err); process.exit(1); });