const {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
  DatabaseError
} = require('sequelize');

const { esRutaApi } = require('../utils/rutasApi');

// Middleware centralizado: traduce los errores de Sequelize y de la API
// a una respuesta JSON con el código de estado correspondiente.
function errorHandler(error, req, res, next) {
  let status = error.status || 500;
  let message = error.message || 'Error interno del servidor.';
  let details = error.details || null;

  if (error.type === 'entity.parse.failed') {
    status = 400;
    message = 'El cuerpo de la solicitud no es un JSON válido.';
  } else if (error instanceof UniqueConstraintError) {
    status = 409;
    message = 'Ya existe un registro con ese nombre.';
    details = null;
  } else if (error instanceof ValidationError) {
    status = 400;
    message = 'Error de validación.';
    details = error.errors.map((item) => item.message);
  } else if (error instanceof ForeignKeyConstraintError) {
    status = 409;
    message = 'No se puede completar la operación porque el registro está relacionado con otros datos.';
  } else if (error instanceof DatabaseError) {
    status = 500;
    message = 'Error al ejecutar la consulta en la base de datos.';
  }

  if (status >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, error);
  }

  // Las rutas de la API siempre responden JSON; las páginas muestran el error.
  if (!esRutaApi(req) && req.accepts('html')) {
    return res.status(status).render('error', {
      titulo: `Error ${status}`,
      status,
      message,
      details
    });
  }

  res.status(status).json({
    error: true,
    status,
    message,
    ...(details ? { details } : {})
  });
}

module.exports = errorHandler;
