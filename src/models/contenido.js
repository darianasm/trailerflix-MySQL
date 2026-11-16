const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Contenido = sequelize.define(
    'Contenido',
    {
      idContenido: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      titulo: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El título es obligatorio.' }
        }
      },
      sinopsis: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'La sinopsis es obligatoria.' }
        }
      },
      temporadas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'Las temporadas deben ser un número entero.' },
          min: { args: [0], msg: 'Las temporadas no pueden ser negativas.' }
        }
      },
      trailer: {
        type: DataTypes.STRING(1000),
        allowNull: true
      },
      idCategoria: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    { tableName: 'contenido' }
  );

  return Contenido;
};
