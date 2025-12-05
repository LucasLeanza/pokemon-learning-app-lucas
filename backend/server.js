// ============================================
// 1. IMPORTAR DEPENDENCIAS
// ============================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ============================================
// 2. MIDDLEWARES
// ============================================

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ============================================
// 3. CONECTAR A MONGODB
// ============================================

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado exitosamente a MongoDB');
    console.log(`📊 Base de datos: ${mongoose.connection.name}`);
  })
  .catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  });

// ============================================
// 4. RUTA DE PRUEBA (HOME)
// ============================================

app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Servidor Pokemon Learning API funcionando',
    version: '1.0.0',
    endpoints: {
      search: 'GET /api/pokemon/search?query=char',
      details: 'GET /api/pokemon/:name',
      byType: 'GET /api/pokemon/type/:type',
      all: 'GET /api/pokemon',
      random: 'GET /api/pokemon/random'
    }
  });
});

// ============================================
// 5. IMPORTAR Y USAR RUTAS DE POKÉMON
// ============================================

const pokemonRoutes = require('./routes/pokemonRoutes');

// Todas las rutas que empiecen con /api/pokemon
// serán manejadas por pokemonRoutes
app.use('/api/pokemon', pokemonRoutes);

// ============================================
// 6. MANEJO DE RUTAS NO ENCONTRADAS (404)
// ============================================

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.url,
    message: 'La ruta que buscas no existe en esta API'
  });
});

// ============================================
// 7. INICIAR EL SERVIDOR
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend esperado en: http://localhost:5173`);
});