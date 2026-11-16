const { sequelize, Contenido } = require('../models');
const contenidoService = require('../services/contenido.service');
const ApiError = require('../utils/ApiError');
const { parsearId, validarContenido, validarActualizacionContenido } = require('../utils/validaciones');

// GET /contenidos
async function listar(req, res, next) {
  try {
    const contenidos = await contenidoService.listar(req.query);
    res.status(200).json({ total: contenidos.length, data: contenidos });
  } catch (error) {
    next(error);
  }
}

// GET /contenidos/:id
async function obtenerPorId(req, res, next) {
  try {
    const id = parsearId(req.params.id);
    const contenido = await contenidoService.obtenerPorId(id);
    res.status(200).json({ data: contenido });
  } catch (error) {
    next(error);
  }
}

// POST /contenidos
async function crear(req, res, next) {
  try {
    const { datos, relaciones } = validarContenido(req.body);
    await contenidoService.verificarCategoria(datos.idCategoria);

    const transaccion = await sequelize.transaction();

    try {
      const creado = await Contenido.create(datos, { transaction: transaccion });
      await contenidoService.guardarRelaciones(creado, relaciones, transaccion);
      await transaccion.commit();

      const contenido = await contenidoService.obtenerPorId(creado.idContenido);

      res
        .status(201)
        .location(`/contenidos/${creado.idContenido}`)
        .json({ message: 'Contenido creado correctamente.', data: contenido });
    } catch (error) {
      await transaccion.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
}

// PUT /contenidos/:id
async function actualizar(req, res, next) {
  try {
    const id = parsearId(req.params.id);
    const contenido = await contenidoService.obtenerPorId(id);
    const { datos, relaciones } = validarActualizacionContenido(req.body);

    if (datos.idCategoria !== undefined) {
      await contenidoService.verificarCategoria(datos.idCategoria);
    }

    const transaccion = await sequelize.transaction();

    try {
      await contenido.update(datos, { transaction: transaccion });
      await contenidoService.guardarRelaciones(contenido, relaciones, transaccion);
      await transaccion.commit();
    } catch (error) {
      await transaccion.rollback();
      throw error;
    }

    const actualizado = await contenidoService.obtenerPorId(id);
    res.status(200).json({ message: 'Contenido actualizado correctamente.', data: actualizado });
  } catch (error) {
    next(error);
  }
}

// DELETE /contenidos/:id
async function eliminar(req, res, next) {
  try {
    const id = parsearId(req.params.id);
    const contenido = await contenidoService.obtenerPorId(id);
    const titulo = contenido.titulo;

    await contenido.destroy();
    res.status(200).json({ message: `Contenido "${titulo}" eliminado correctamente.` });
  } catch (error) {
    next(error);
  }
}

// GET /catalogo
async function catalogo(req, res, next) {
  try {
    const contenidos = await contenidoService.listar(req.query);
    const data = contenidos.map(contenidoService.formatearCatalogo);
    res.status(200).json({ total: data.length, data });
  } catch (error) {
    next(error);
  }
}

// GET /titulo/:title
async function porTitulo(req, res, next) {
  try {
    const contenidos = await contenidoService.listar({ ...req.query, titulo: req.params.title });
    const data = contenidos.map(contenidoService.formatearCatalogo);

    if (data.length === 0) {
      throw new ApiError(404, `No se encontraron títulos que contengan "${req.params.title}".`);
    }

    res.status(200).json({ total: data.length, data });
  } catch (error) {
    next(error);
  }
}

// GET /categoria/:cat
async function porCategoria(req, res, next) {
  try {
    const contenidos = await contenidoService.listar({ ...req.query, categoria: req.params.cat });
    const data = contenidos.map(contenidoService.formatearCatalogo);

    if (data.length === 0) {
      throw new ApiError(404, `No se encontraron contenidos para la categoría "${req.params.cat}".`);
    }

    res.status(200).json({ total: data.length, data });
  } catch (error) {
    next(error);
  }
}

// GET /reparto/:act
async function porReparto(req, res, next) {
  try {
    const contenidos = await contenidoService.listar({ ...req.query, actor: req.params.act });
    const data = contenidos.map((contenido) => ({
      id: contenido.idContenido,
      titulo: contenido.titulo,
      reparto: contenido.reparto.map((actor) => actor.nombre)
    }));

    if (data.length === 0) {
      throw new ApiError(404, `No se encontraron contenidos con el actor o actriz "${req.params.act}".`);
    }

    res.status(200).json({ total: data.length, data });
  } catch (error) {
    next(error);
  }
}

// GET /trailer/:id
async function porTrailer(req, res, next) {
  try {
    const id = parsearId(req.params.id);
    const contenido = await contenidoService.obtenerPorId(id);

    if (!contenido.trailer) {
      throw new ApiError(404, `El contenido "${contenido.titulo}" no tiene trailer disponible.`);
    }

    res.status(200).json({
      data: {
        id: contenido.idContenido,
        titulo: contenido.titulo,
        trailer: contenido.trailer
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  catalogo,
  porTitulo,
  porCategoria,
  porReparto,
  porTrailer
};
