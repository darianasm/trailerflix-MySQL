const { esRutaApi } = require('../utils/rutasApi');

function notFound(req, res) {
  const message = `Ruta no encontrada: ${req.method} ${req.originalUrl}`;

  if (!esRutaApi(req) && req.accepts('html')) {
    return res.status(404).render('error', {
      titulo: 'Página no encontrada',
      status: 404,
      message,
      details: null
    });
  }

  res.status(404).json({ error: true, status: 404, message });
}

module.exports = notFound;
