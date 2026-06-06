// config/db.js
// Conexión a MongoDB usando Mongoose

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error(
        'MONGODB_URI no configurada. Por favor, configura tu string de conexión en .env'
      );
    }

    await mongoose.connect(mongoURI);

    console.log('✅ MongoDB conectado exitosamente');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
