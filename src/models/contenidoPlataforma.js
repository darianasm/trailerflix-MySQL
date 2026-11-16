const { DataTypes } = require('sequelize');

// Tabla intermedia de la relación muchos a muchos entre contenido y plataforma.
module.exports = (sequelize) => {
  const ContenidoPlataforma = sequelize.define(
    'ContenidoPlataforma',
    {
      idContenido: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      idPlataforma: {
        type: DataTypes.INTEGER,
        primaryKey: true
      }
    },
    { tableName: 'contenido_plataforma', timestamps: false }
  );

  return ContenidoPlataforma;
};
