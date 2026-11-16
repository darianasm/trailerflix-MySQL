const { DataTypes } = require('sequelize');

// Tabla intermedia de la relación muchos a muchos entre contenido y género.
module.exports = (sequelize) => {
  const ContenidoGenero = sequelize.define(
    'ContenidoGenero',
    {
      idContenido: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      idGenero: {
        type: DataTypes.INTEGER,
        primaryKey: true
      }
    },
    { tableName: 'contenido_genero', timestamps: false }
  );

  return ContenidoGenero;
};
