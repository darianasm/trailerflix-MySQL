const router = require('express').Router();
const webController = require('../controllers/web.controller');

// Vistas renderizadas con EJS. Los endpoints JSON siguen disponibles en /api.
router.get('/', webController.catalogo);

router.get('/contenido/nuevo', webController.formularioNuevo);
router.post('/contenido', webController.crear);

router.get('/contenido/:id/editar', webController.formularioEdicion);
router.post('/contenido/:id/editar', webController.actualizar);
router.post('/contenido/:id/eliminar', webController.eliminar);

router.get('/contenido/:id', webController.detalle);

module.exports = router;
