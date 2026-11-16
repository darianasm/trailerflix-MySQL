const ApiError = require('./ApiError');

// Acepta enteros reales o strings numéricos (los formularios HTML envían strings).
// Rechaza booleanos, arrays, objetos, decimales y textos.
function esEnteroValido(valor) {
  if (typeof valor === 'number') {
    return Number.isInteger(valor);
  }

  if (typeof valor === 'string') {
    const texto = valor.trim();
    return /^-?\d+$/.test(texto) && Number.isInteger(Number(texto));
  }

  return false;
}

function convertirEntero(valor) {
  return typeof valor === 'number' ? valor : Number(valor.trim());
}

function parsearId(valor, etiqueta = 'id') {
  if (!esEnteroValido(valor)) {
    throw new ApiError(400, `El ${etiqueta} debe ser un número entero positivo.`);
  }

  const numero = convertirEntero(valor);

  if (numero <= 0 || numero > 2147483647) {
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

  if (!esEnteroValido(body.temporadas) || convertirEntero(body.temporadas) < 0) {
    errores.push("El campo 'temporadas' debe ser un entero mayor o igual a 0.");
  } else {
    datos.temporadas = convertirEntero(body.temporadas);
  }

  if (body.trailer !== undefined) {
    if (body.trailer !== null && typeof body.trailer !== 'string') {
      errores.push("El campo 'trailer' debe ser un texto o null.");
    } else {
      datos.trailer = body.trailer === '' ? null : body.trailer;
    }
  }

  if (!esEnteroValido(body.idCategoria) || convertirEntero(body.idCategoria) <= 0) {
    errores.push("El campo 'idCategoria' es obligatorio y debe ser un entero positivo.");
  } else {
    datos.idCategoria = convertirEntero(body.idCategoria);
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
    if (!esEnteroValido(body.temporadas) || convertirEntero(body.temporadas) < 0) {
      errores.push("El campo 'temporadas' debe ser un entero mayor o igual a 0.");
    } else {
      datos.temporadas = convertirEntero(body.temporadas);
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
    if (!esEnteroValido(body.idCategoria) || convertirEntero(body.idCategoria) <= 0) {
      errores.push("El campo 'idCategoria' debe ser un entero positivo.");
    } else {
      datos.idCategoria = convertirEntero(body.idCategoria);
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

    const ids = [];
    const invalido = body[campo].some((valor) => {
      if (!esEnteroValido(valor)) return true;

      const id = convertirEntero(valor);
      if (id <= 0) return true;

      ids.push(id);
      return false;
    });

    if (invalido) {
      errores.push(`El campo '${campo}' solo admite ids enteros positivos.`);
      return;
    }

    relaciones[campo] = [...new Set(ids)];
  });

  return relaciones;
}

module.exports = {
  esEnteroValido,
  convertirEntero,
  parsearId,
  validarContenido,
  validarActualizacionContenido
};
