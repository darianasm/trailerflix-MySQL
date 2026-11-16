const { sequelize, Contenido, Categoria, Genero, Plataforma } = require('../models');
const contenidoService = require('../services/contenido.service');
const ApiError = require('../utils/ApiError');
const { parsearId, validarContenido, validarActualizacionContenido } = require('../utils/validaciones');

// Convierte un contenido de Sequelize en un objeto simple para las vistas.
function formatearContenido(contenido) {
  const datos = contenido.toJSON ? contenido.toJSON() : contenido;
  const ordenarNombres = (items) =>
    [...(items || [])]
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
      .map((item) => item.nombre);

  return {
    id: datos.idContenido,
    titulo: datos.titulo,
    sinopsis: datos.sinopsis,
    temporadas: datos.temporadas,
    trailer: datos.trailer,
    categoria: datos.categoria ? datos.categoria.nombre : 'Sin categoría',
    generos: ordenarNombres(datos.generos),
    reparto: (datos.reparto || []).map((actor) => actor.nombre),
    plataformas: ordenarNombres(datos.plataformas)
  };
}

async function obtenerOpciones() {
  const [categorias, generos, plataformas] = await Promise.all([
    Categoria.findAll({ order: [['nombre', 'ASC']], raw: true }),
    Genero.findAll({ order: [['nombre', 'ASC']], raw: true }),
    Plataforma.findAll({ order: [['nombre', 'ASC']], raw: true })
  ]);

  return { categorias, generos, plataformas };
}

async function obtenerEstadisticas() {
  const [total, categoriaPelicula] = await Promise.all([
    Contenido.count(),
    Categoria.findOne({ where: { nombre: 'Película' } })
  ]);

  const peliculas = categoriaPelicula
    ? await Contenido.count({ where: { idCategoria: categoriaPelicula.idCategoria } })
    : 0;

  return { total, peliculas, series: total - peliculas };
}

function normalizarIds(valor) {
  if (valor === undefined || valor === null || valor === '') return [];

  const lista = Array.isArray(valor) ? valor : [valor];

  // Convierte los strings numéricos de los checkboxes y deja los valores
  // inválidos intactos para que la validación los rechace con un 400.
  return lista.map((item) => {
    if (typeof item === 'string' && /^-?\d+$/.test(item.trim())) {
      return Number(item.trim());
    }

    return item;
  });
}

// Los formularios HTML no distinguen entre "campo ausente" y "lista vacía":
// por eso siempre convertimos generos y plataformas en arrays.
function prepararBody(body) {
  return {
    ...body,
    generos: normalizarIds(body.generos),
    plataformas: normalizarIds(body.plataformas)
  };
}

async function renderizarFormularioError(res, { modo, id, body, error }) {
  const opciones = await obtenerOpciones();

  return res.status(400).render('formulario', {
    titulo: modo === 'nuevo' ? 'Nuevo contenido' : 'Editar contenido',
    modo,
    id: id || null,
    accion: modo === 'nuevo' ? '/contenido' : `/contenido/${id}/editar`,
    opciones,
    valores: {
      titulo: body.titulo || '',
      sinopsis: body.sinopsis || '',
      temporadas: body.temporadas ?? 0,
      trailer: body.trailer || '',
      idCategoria: Number(body.idCategoria) || '',
      generos: normalizarIds(body.generos),
      plataformas: normalizarIds(body.plataformas)
    },
    error: { message: error.message, details: error.details || [] }
  });
}

// GET /
async function catalogo(req, res, next) {
  try {
    const [contenidos, opciones, estadisticas] = await Promise.all([
      contenidoService.listar(req.query),
      obtenerOpciones(),
      obtenerEstadisticas()
    ]);

    res.render('catalogo', {
      titulo: 'Catálogo',
      contenidos: contenidos.map(formatearContenido),
      opciones,
      estadisticas,
      filtros: {
        titulo: String(req.query.titulo || ''),
        categoria: String(req.query.categoria || ''),
        genero: String(req.query.genero || ''),
        plataforma: String(req.query.plataforma || ''),
        trailer: req.query.trailer === 'true',
        orden: String(req.query.orden || 'id')
      },
      mensaje: req.query.ok ? String(req.query.ok) : null
    });
  } catch (error) {
    next(error);
  }
}

// GET /contenido/:id
async function detalle(req, res, next) {
  try {
    const id = parsearId(req.params.id);
    const contenido = await contenidoService.obtenerPorId(id);

    res.render('detalle', {
      titulo: contenido.titulo,
      contenido: formatearContenido(contenido),
      mensaje: req.query.ok ? String(req.query.ok) : null
    });
  } catch (error) {
    next(error);
  }
}

// GET /contenido/nuevo
async function formularioNuevo(req, res, next) {
  try {
    const opciones = await obtenerOpciones();

    res.render('formulario', {
      titulo: 'Nuevo contenido',
      modo: 'nuevo',
      id: null,
      accion: '/contenido',
      opciones,
      valores: {
        titulo: '',
        sinopsis: '',
        temporadas: 0,
        trailer: '',
        idCategoria: opciones.categorias[0] ? opciones.categorias[0].idCategoria : '',
        generos: [],
        plataformas: []
      },
      error: null
    });
  } catch (error) {
    next(error);
  }
}

// GET /contenido/:id/editar
async function formularioEdicion(req, res, next) {
  try {
    const id = parsearId(req.params.id);
    const [contenido, opciones] = await Promise.all([
      contenidoService.obtenerPorId(id),
      obtenerOpciones()
    ]);

    res.render('formulario', {
      titulo: 'Editar contenido',
      modo: 'editar',
      id,
      accion: `/contenido/${id}/editar`,
      opciones,
      valores: {
        titulo: contenido.titulo,
        sinopsis: contenido.sinopsis,
        temporadas: contenido.temporadas,
        trailer: contenido.trailer || '',
        idCategoria: contenido.idCategoria,
        generos: (contenido.generos || []).map((genero) => genero.idGenero),
        plataformas: (contenido.plataformas || []).map((plataforma) => plataforma.idPlataforma)
      },
      error: null
    });
  } catch (error) {
    next(error);
  }
}

// POST /contenido
async function crear(req, res, next) {
  const body = prepararBody(req.body);

  try {
    const { datos, relaciones } = validarContenido(body);
    await contenidoService.verificarCategoria(datos.idCategoria);

    const transaccion = await sequelize.transaction();
    let creado;

    try {
      creado = await Contenido.create(datos, { transaction: transaccion });
      await contenidoService.guardarRelaciones(creado, relaciones, transaccion);
      await transaccion.commit();
    } catch (error) {
      await transaccion.rollback();
      throw error;
    }

    res.redirect(`/contenido/${creado.idContenido}?ok=${encodeURIComponent('Contenido creado correctamente.')}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return renderizarFormularioError(res, { modo: 'nuevo', body, error });
    }

    next(error);
  }
}

// POST /contenido/:id/editar
async function actualizar(req, res, next) {
  let id;

  try {
    id = parsearId(req.params.id);
  } catch (error) {
    return next(error);
  }

  const body = prepararBody(req.body);

  try {
    const contenido = await contenidoService.obtenerPorId(id);
    const { datos, relaciones } = validarActualizacionContenido(body);

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

    res.redirect(`/contenido/${id}?ok=${encodeURIComponent('Contenido actualizado correctamente.')}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return renderizarFormularioError(res, { modo: 'editar', id, body, error });
    }

    next(error);
  }
}

// POST /contenido/:id/eliminar
async function eliminar(req, res, next) {
  try {
    const id = parsearId(req.params.id);
    const contenido = await contenidoService.obtenerPorId(id);
    const titulo = contenido.titulo;

    await contenido.destroy();
    res.redirect(`/?ok=${encodeURIComponent(`Contenido "${titulo}" eliminado correctamente.`)}`);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  catalogo,
  detalle,
  formularioNuevo,
  formularioEdicion,
  crear,
  actualizar,
  eliminar
};
