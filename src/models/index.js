const sequelize = require('../config/database');

const Categoria = require('./categoria')(sequelize);
const Genero = require('./genero')(sequelize);
const Actor = require('./actor')(sequelize);
const Plataforma = require('./plataforma')(sequelize);
const Contenido = require('./contenido')(sequelize);
const ContenidoActor = require('./contenidoActor')(sequelize);
const ContenidoGenero = require('./contenidoGenero')(sequelize);
const ContenidoPlataforma = require('./contenidoPlataforma')(sequelize);

// ---------------------------------------------------------------------------
// Relaciones
// ---------------------------------------------------------------------------

// Una categoría tiene muchos contenidos (1:N).
Categoria.hasMany(Contenido, {
  foreignKey: 'idCategoria',
  as: 'contenidos'
});

Contenido.belongsTo(Categoria, {
  foreignKey: 'idCategoria',
  as: 'categoria'
});

// Contenido y actor (N:M) a través de contenido_actor.
Contenido.belongsToMany(Actor, {
  through: ContenidoActor,
  foreignKey: 'idContenido',
  otherKey: 'idActor',
  as: 'reparto'
});

Actor.belongsToMany(Contenido, {
  through: ContenidoActor,
  foreignKey: 'idActor',
  otherKey: 'idContenido',
  as: 'contenidos'
});

// Contenido y género (N:M) a través de contenido_genero.
Contenido.belongsToMany(Genero, {
  through: ContenidoGenero,
  foreignKey: 'idContenido',
  otherKey: 'idGenero',
  as: 'generos'
});

Genero.belongsToMany(Contenido, {
  through: ContenidoGenero,
  foreignKey: 'idGenero',
  otherKey: 'idContenido',
  as: 'contenidos'
});

// Contenido y plataforma (N:M) a través de contenido_plataforma.
Contenido.belongsToMany(Plataforma, {
  through: ContenidoPlataforma,
  foreignKey: 'idContenido',
  otherKey: 'idPlataforma',
  as: 'plataformas'
});

Plataforma.belongsToMany(Contenido, {
  through: ContenidoPlataforma,
  foreignKey: 'idPlataforma',
  otherKey: 'idContenido',
  as: 'contenidos'
});

module.exports = {
  sequelize,
  Categoria,
  Genero,
  Actor,
  Plataforma,
  Contenido,
  ContenidoActor,
  ContenidoGenero,
  ContenidoPlataforma
};
