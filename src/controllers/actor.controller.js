const { Actor } = require('../models');
const createCrudController = require('./crudController');

module.exports = createCrudController(Actor, {
  nombre: 'actor',
  ruta: '/api/actores',
  pk: 'idActor'
});
