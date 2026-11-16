const express = require('express');
const path = require('path');

const routes = require('./routes');
const legacyRoutes = require('./routes/legacy.routes');
const webRoutes = require('./routes/web.routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Motor de plantillas para las páginas del catálogo.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Parseo de JSON y formularios.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (CSS).
app.use(express.static(path.join(__dirname, '..', 'public')));

// API REST.
app.use('/api', routes);

// Alias de la primera preentrega sin el prefijo /api.
app.use(legacyRoutes);

// Páginas HTML renderizadas con EJS.
app.use(webRoutes);

// Rutas inexistentes y manejo centralizado de errores (siempre al final).
app.use(notFound);
app.use(errorHandler);

module.exports = app;
