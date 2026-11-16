function notFound(req, res) {
  res.status(404).json({
    error: true,
    status: 404,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
}

module.exports = notFound;
