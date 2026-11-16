const ApiError = require('./ApiError');

function parsearId(valor, etiqueta = 'id') {
  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero <= 0 || numero > 2147483647) {
    throw new ApiError(400, `El ${etiqueta} debe ser un número entero positivo.`);
  }

  return numero;
}

function validarContenido(body) {
  const errores = [];
  const datos = {};

  if (typeof body.titulo !== 'string' || !body.titulo.trim()) {
    errores.push('El título es obligatorio.');
  } else {
    datos.titulo = body.titulo.trim();
  }

  if (typeof body.sinopsis !== 'string' || !body.sinopsis.trim()) {
    errores.push('La sinopsis es obligatoria.');
  } else {
    datos.sinopsis = body.sinopsis.trim();
  }

  const temporadas = Number(body.temporadas);
  if (
    body.temporadas === undefined ||
    body.temporadas === null ||
    body.temporadas === '' ||
    !Number.isInteger(temporadas) ||
    temporadas < 0
  ) {
    errores.push("El campo 'temporadas' debe ser un entero mayor o igual a 0.");
  } else {
    datos.temporadas = temporadas;
  }

  if (body.trailer !== undefined) {
    if (body.trailer !== null && typeof body.trailer !== 'string') {
      errores.push("El campo 'trailer' debe ser un texto o null.");
    } else {
      datos.trailer = body.trailer === '' ? null : body.trailer;
    }
  }

  const idCategoria = Number(body.idCategoria);
  if (!Number.isInteger(idCategoria) || idCategoria <= 0) {
    errores.push("El campo 'idCategoria' es obligatorio y debe ser un entero positivo.");
  } else {
    datos.idCategoria = idCategoria;
  }

  const relaciones = validarRelaciones(body, errores);

  if (errores.length) {
    throw new ApiError(400, 'Datos inválidos.', errores);
  }

  return { datos, relaciones };
}

function validarActualizacionContenido(body) {
  const errores = [];
  const datos = {};
  const tiene = (campo) => Object.prototype.hasOwnProperty.call(body, campo);

  if (tiene('titulo')) {
    if (typeof body.titulo !== 'string' || !body.titulo.trim()) {
      errores.push('El título no puede estar vacío.');
    } else {
      datos.titulo = body.titulo.trim();
    }
  }

  if (tiene('sinopsis')) {
    if (typeof body.sinopsis !== 'string' || !body.sinopsis.trim()) {
      errores.push('La sinopsis no puede estar vacía.');
    } else {
      datos.sinopsis = body.sinopsis.trim();
    }
  }

  if (tiene('temporadas')) {
    const temporadas = Number(body.temporadas);
    if (!Number.isInteger(temporadas) || temporadas < 0) {
      errores.push("El campo 'temporadas' debe ser un entero mayor o igual a 0.");
    } else {
      datos.temporadas = temporadas;
    }
  }

  if (tiene('trailer')) {
    if (body.trailer !== null && typeof body.trailer !== 'string') {
      errores.push("El campo 'trailer' debe ser un texto o null.");
    } else {
      datos.trailer = body.trailer === '' ? null : body.trailer;
    }
  }

  if (tiene('idCategoria')) {
    const idCategoria = Number(body.idCategoria);
    if (!Number.isInteger(idCategoria) || idCategoria <= 0) {
      errores.push("El campo 'idCategoria' debe ser un entero positivo.");
    } else {
      datos.idCategoria = idCategoria;
    }
  }

  const relaciones = validarRelaciones(body, errores);
  const sinCambios =
    Object.keys(datos).length === 0 && Object.keys(relaciones).length === 0;

  if (errores.length) {
    throw new ApiError(400, 'Datos inválidos.', errores);
  }

  if (sinCambios) {
    throw new ApiError(400, 'No se enviaron campos para actualizar.');
  }

  return { datos, relaciones };
}

function validarRelaciones(body, errores) {
  const relaciones = {};

  ['generos', 'reparto', 'plataformas'].forEach((campo) => {
    if (body[campo] === undefined) return;

    if (!Array.isArray(body[campo])) {
      errores.push(`El campo '${campo}' debe ser un array de ids.`);
      return;
    }

    const ids = body[campo].map(Number);
    if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
      errores.push(`El campo '${campo}' solo admite ids enteros positivos.`);
      return;
    }

    relaciones[campo] = [...new Set(ids)];
  });

  return relaciones;
}

module.exports = {
  parsearId,
  validarContenido,
  validarActualizacionContenido
};
