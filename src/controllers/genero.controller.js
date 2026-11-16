const { Genero } = require('../models');
const createCrudController = require('./crudController');

module.exports = createCrudController(Genero, {
  nombre: 'género',
  ruta: '/generos',
  pk: 'idGenero'
});
