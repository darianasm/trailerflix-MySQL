const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Actor = sequelize.define(
    'Actor',
    {
      idActor: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El nombre del actor no puede estar vacío.' }
        }
      }
    },
    { tableName: 'actor' }
  );

  return Actor;
};
