const router = require('express').Router();
const contenidoController = require('../controllers/contenido.controller');

// Alias sin el prefijo /api para mantener compatibilidad con la primera
// preentrega, que exponía estas mismas búsquedas en la raíz del servidor.
router.get('/catalogo', contenidoController.catalogo);
router.get('/titulo/:title', contenidoController.porTitulo);
router.get('/categoria/:cat', contenidoController.porCategoria);
router.get('/reparto/:act', contenidoController.porReparto);
router.get('/trailer/:id', contenidoController.porTrailer);

module.exports = router;
