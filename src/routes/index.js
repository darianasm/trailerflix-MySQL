const router = require('express').Router();

const contenidoRoutes = require('./contenido.routes');
const categoriaRoutes = require('./categoria.routes');
const generoRoutes = require('./genero.routes');
const actorRoutes = require('./actor.routes');
const plataformaRoutes = require('./plataforma.routes');

const contenidoController = require('../controllers/contenido.controller');
const { sequelize } = require('../models');
const ApiError = require('../utils/ApiError');

// Estado del servidor y de la conexión con MySQL.
router.get('/health', async (req, res, next) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: 'ok',
      database: process.env.DB_NAME,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(new ApiError(503, 'No se pudo conectar con la base de datos.'));
  }
});

// CRUD principal.
router.use('/contenidos', contenidoRoutes);

// CRUD de tablas relacionadas.
router.use('/categorias', categoriaRoutes);
router.use('/generos', generoRoutes);
router.use('/actores', actorRoutes);
router.use('/plataformas', plataformaRoutes);

// Búsquedas heredadas de la primera preentrega.
router.get('/catalogo', contenidoController.catalogo);
router.get('/titulo/:title', contenidoController.porTitulo);
router.get('/categoria/:cat', contenidoController.porCategoria);
router.get('/reparto/:act', contenidoController.porReparto);
router.get('/trailer/:id', contenidoController.porTrailer);

module.exports = router;
