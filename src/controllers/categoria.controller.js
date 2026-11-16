const { Categoria } = require('../models');
const createCrudController = require('./crudController');

module.exports = createCrudController(Categoria, {
  nombre: 'categoría',
  articulo: 'la',
  ruta: '/categorias',
  pk: 'idCategoria'
});
