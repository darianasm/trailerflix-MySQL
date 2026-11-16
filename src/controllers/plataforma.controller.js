const { Plataforma } = require('../models');
const createCrudController = require('./crudController');

module.exports = createCrudController(Plataforma, {
  nombre: 'plataforma',
  articulo: 'la',
  ruta: '/api/plataformas',
  pk: 'idPlataforma',
  camposPermitidos: ['nombre', 'imagen']
});
