const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Plataforma = sequelize.define(
    'Plataforma',
    {
      idPlataforma: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El nombre de la plataforma no puede estar vacío.' }
        }
      },
      imagen: {
        type: DataTypes.STRING(500),
        allowNull: true
      }
    },
    { tableName: 'plataforma' }
  );

  return Plataforma;
};
