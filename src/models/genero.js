const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Genero = sequelize.define(
    'Genero',
    {
      idGenero: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El nombre del género no puede estar vacío.' }
        }
      }
    },
    { tableName: 'genero' }
  );

  return Genero;
};
