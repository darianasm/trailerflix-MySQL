require('dotenv').config({ quiet: true });

const app = require('./src/app');
const { sequelize } = require('./src/models');

const PORT = Number(process.env.PORT) || 3000;

async function iniciar() {
  try {
    await sequelize.authenticate();
    console.log(`Conexión a MySQL establecida (base: ${process.env.DB_NAME}).`);

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`API disponible en http://localhost:${PORT}/contenidos`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

iniciar();
