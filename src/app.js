const express = require('express');
const path = require('path');

const routes = require('./routes');
const legacyRoutes = require('./routes/legacy.routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Parseo de JSON y formularios.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTML de prueba servido desde /public.
app.use(express.static(path.join(__dirname, '..', 'public')));

// API REST.
app.use('/api', routes);

// Alias de la primera preentrega sin el prefijo /api.
app.use(legacyRoutes);

// Rutas inexistentes y manejo centralizado de errores (siempre al final).
app.use(notFound);
app.use(errorHandler);

module.exports = app;
