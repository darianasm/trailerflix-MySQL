const ApiError = require('../utils/ApiError');
const { parsearId } = require('../utils/validaciones');

// Controlador CRUD genérico para las tablas simples (categorías, géneros,
// actores y plataformas). Usa findOne, findAll, create, update y destroy.
function createCrudController(Model, options) {
  const {
    nombre,
    articulo = 'el',
    ruta,
    pk,
    camposPermitidos = ['nombre'],
    camposObligatorios = ['nombre']
  } = options;

  function prepararDatos(body, { parcial }) {
    const datos = {};
    const errores = [];

    camposPermitidos.forEach((campo) => {
      if (body[campo] === undefined) return;

      let valor = body[campo];
      if (typeof valor === 'string') valor = valor.trim();
      if (valor === '') valor = null;

      if (camposObligatorios.includes(campo) && !valor) {
        errores.push(`El campo '${campo}' no puede estar vacío.`);
        return;
      }

      datos[campo] = valor;
    });

    if (!parcial) {
      camposObligatorios.forEach((campo) => {
        if (datos[campo] === undefined) {
          errores.push(`El campo '${campo}' es obligatorio.`);
        }
      });
    }

    if (parcial && Object.keys(datos).length === 0) {
      errores.push('No se enviaron campos para actualizar.');
    }

    if (errores.length) {
      throw new ApiError(400, 'Datos inválidos.', errores);
    }

    return datos;
  }

  async function buscar(id) {
    const registro = await Model.findOne({ where: { [pk]: id } });

    if (!registro) {
      throw new ApiError(404, `No se encontró ${articulo} ${nombre} con id ${id}.`);
    }

    return registro;
  }

  return {
    // GET /recurso
    listar: async (req, res, next) => {
      try {
        const data = await Model.findAll({ order: [[pk, 'ASC']] });
        res.status(200).json({ total: data.length, data });
      } catch (error) {
        next(error);
      }
    },

    // GET /recurso/:id
    obtener: async (req, res, next) => {
      try {
        const id = parsearId(req.params.id);
        const registro = await buscar(id);
        res.status(200).json({ data: registro });
      } catch (error) {
        next(error);
      }
    },

    // POST /recurso
    crear: async (req, res, next) => {
      try {
        const datos = prepararDatos(req.body, { parcial: false });
        const registro = await Model.create(datos);

        res
          .status(201)
          .location(`${ruta}/${registro[pk]}`)
          .json({ message: `Se creó ${articulo} ${nombre} correctamente.`, data: registro });
      } catch (error) {
        next(error);
      }
    },

    // PUT /recurso/:id
    actualizar: async (req, res, next) => {
      try {
        const id = parsearId(req.params.id);
        const registro = await buscar(id);
        const datos = prepararDatos(req.body, { parcial: true });

        await registro.update(datos);
        res.status(200).json({
          message: `Se actualizó ${articulo} ${nombre} correctamente.`,
          data: registro
        });
      } catch (error) {
        next(error);
      }
    },

    // DELETE /recurso/:id
    eliminar: async (req, res, next) => {
      try {
        const id = parsearId(req.params.id);
        const registro = await buscar(id);

        await registro.destroy();
        res.status(200).json({ message: `Se eliminó ${articulo} ${nombre} correctamente.` });
      } catch (error) {
        next(error);
      }
    }
  };
}

module.exports = createCrudController;
