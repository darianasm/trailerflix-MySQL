const { DataTypes } = require('sequelize');

// Tabla intermedia de la relación muchos a muchos entre contenido y actor.
module.exports = (sequelize) => {
  const ContenidoActor = sequelize.define(
    'ContenidoActor',
    {
      idContenido: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      idActor: {
        type: DataTypes.INTEGER,
        primaryKey: true
      }
    },
    { tableName: 'contenido_actor', timestamps: false }
  );

  return ContenidoActor;
};
