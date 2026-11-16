const { Op } = require('sequelize');
const { Contenido, Categoria, Genero, Actor, Plataforma } = require('../models');
const ApiError = require('../utils/ApiError');

// Datos que se devuelven siempre que se consulta un contenido.
const includeCompleto = [
  {
    model: Categoria,
    as: 'categoria',
    attributes: ['idCategoria', 'nombre']
  },
  {
    model: Genero,
    as: 'generos',
    attributes: ['idGenero', 'nombre'],
    through: { attributes: [] }
  },
  {
    model: Actor,
    as: 'reparto',
    attributes: ['idActor', 'nombre'],
    through: { attributes: [] }
  },
  {
    model: Plataforma,
    as: 'plataformas',
    attributes: ['idPlataforma', 'nombre', 'imagen'],
    through: { attributes: [] }
  }
];

const ORDENES = {
  id: 'idContenido',
  titulo: 'titulo',
  temporadas: 'temporadas'
};

function separarLista(valor) {
  if (!valor) return [];

  return valor
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

// Arma el WHERE con los filtros propios de la tabla contenido.
function construirWhere(query) {
  const where = {};

  if (query.titulo) {
    where.titulo = { [Op.like]: `%${query.titulo.trim()}%` };
  }

  if (query.temporadas !== undefined) {
    const temporadas = Number(query.temporadas);
    if (!Number.isInteger(temporadas) || temporadas < 0) {
      throw new ApiError(400, "El parámetro 'temporadas' debe ser un entero mayor o igual a 0.");
    }
    where.temporadas = temporadas;
  }

  if (query.trailer !== undefined) {
    const valor = String(query.trailer).toLowerCase();
    if (valor !== 'true' && valor !== 'false') {
      throw new ApiError(400, "El parámetro 'trailer' solo acepta los valores true o false.");
    }
    where.trailer = valor === 'true' ? { [Op.ne]: null } : { [Op.is]: null };
  }

  return where;
}

// Arma los includes que se usan como filtro (categoría, género, actor, plataforma).
function construirIncludesFiltro(query) {
  const includes = [];

  if (query.categoria) {
    includes.push({
      model: Categoria,
      as: 'categoria',
      attributes: [],
      required: true,
      where: { nombre: query.categoria.trim() }
    });
  }

  const generos = separarLista(query.genero);
  if (generos.length) {
    includes.push({
      model: Genero,
      as: 'generos',
      attributes: [],
      through: { attributes: [] },
      required: true,
      where: { nombre: { [Op.in]: generos } }
    });
  }

  if (query.actor) {
    includes.push({
      model: Actor,
      as: 'reparto',
      attributes: [],
      through: { attributes: [] },
      required: true,
      where: { nombre: { [Op.like]: `%${query.actor.trim()}%` } }
    });
  }

  const plataformas = separarLista(query.plataforma);
  if (plataformas.length) {
    includes.push({
      model: Plataforma,
      as: 'plataformas',
      attributes: [],
      through: { attributes: [] },
      required: true,
      where: { nombre: { [Op.in]: plataformas } }
    });
  }

  return includes;
}

function construirOrden(query) {
  if (!query.orden) return [['idContenido', 'ASC']];

  const columna = ORDENES[query.orden];
  if (!columna) {
    throw new ApiError(400, "El parámetro 'orden' solo acepta id, titulo o temporadas.");
  }

  const direccion = (query.dir || 'asc').toUpperCase();
  if (direccion !== 'ASC' && direccion !== 'DESC') {
    throw new ApiError(400, "El parámetro 'dir' solo acepta asc o desc.");
  }

  return [[columna, direccion]];
}

// Primero se buscan los ids que cumplen los filtros y después se traen los
// contenidos completos, así los géneros y el reparto no quedan recortados.
async function listar(query = {}) {
  const where = construirWhere(query);
  const includesFiltro = construirIncludesFiltro(query);
  const order = construirOrden(query);

  if (includesFiltro.length > 0) {
    const coincidencias = await Contenido.findAll({
      attributes: ['idContenido'],
      where,
      include: includesFiltro,
      raw: true
    });

    const ids = [...new Set(coincidencias.map((item) => item.idContenido))];
    if (ids.length === 0) return [];

    where.idContenido = { [Op.in]: ids };
  }

  return Contenido.findAll({
    where,
    include: includeCompleto,
    order,
    distinct: true
  });
}

async function obtenerPorId(id) {
  const contenido = await Contenido.findOne({
    where: { idContenido: id },
    include: includeCompleto
  });

  if (!contenido) {
    throw new ApiError(404, `No se encontró el contenido con id ${id}.`);
  }

  return contenido;
}

async function verificarCategoria(idCategoria) {
  const categoria = await Categoria.findOne({ where: { idCategoria } });

  if (!categoria) {
    throw new ApiError(400, `La categoría con id ${idCategoria} no existe.`);
  }

  return categoria;
}

async function guardarRelaciones(contenido, relaciones, transaction) {
  if (relaciones.generos) await contenido.setGeneros(relaciones.generos, { transaction });
  if (relaciones.reparto) await contenido.setReparto(relaciones.reparto, { transaction });
  if (relaciones.plataformas) {
    await contenido.setPlataformas(relaciones.plataformas, { transaction });
  }
}

// Formato resumido que usan /catalogo y las búsquedas de la preentrega 1.
function formatearCatalogo(contenido) {
  const datos = contenido.toJSON ? contenido.toJSON() : contenido;

  return {
    id: datos.idContenido,
    titulo: datos.titulo,
    categoria: datos.categoria ? datos.categoria.nombre : null,
    generos: (datos.generos || []).map((genero) => genero.nombre),
    reparto: (datos.reparto || []).map((actor) => actor.nombre),
    plataformas: (datos.plataformas || []).map((plataforma) => plataforma.nombre),
    temporadas: datos.temporadas,
    trailer: datos.trailer
  };
}

module.exports = {
  listar,
  obtenerPorId,
  formatearCatalogo,
  verificarCategoria,
  guardarRelaciones,
  includeCompleto
};
