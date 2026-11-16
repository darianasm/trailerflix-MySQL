const API = '/api';

const estado = {
  contenidos: [],
  categorias: [],
  generos: [],
  plataformas: []
};

let modalDetalle;
let modalFormulario;

document.addEventListener('DOMContentLoaded', iniciar);

async function iniciar() {
  modalDetalle = new bootstrap.Modal(document.getElementById('modalDetalle'));
  modalFormulario = new bootstrap.Modal(document.getElementById('modalFormulario'));

  conectarEventos();

  await Promise.all([cargarOpciones(), cargarEstadisticas()]);
  await cargarContenidos();
}

function conectarEventos() {
  document.getElementById('formFiltros').addEventListener('submit', (evento) => {
    evento.preventDefault();
    cargarContenidos();
  });

  document.getElementById('btnLimpiar').addEventListener('click', () => {
    document.getElementById('formFiltros').reset();
    cargarContenidos();
  });

  ['filtroCategoria', 'filtroGenero', 'filtroPlataforma', 'filtroTrailer', 'filtroOrden'].forEach((id) => {
    document.getElementById(id).addEventListener('change', cargarContenidos);
  });

  document.getElementById('btnNuevo').addEventListener('click', () => abrirFormulario(null));

  document.getElementById('contenidos').addEventListener('click', manejarAccion);

  document.getElementById('formContenido').addEventListener('submit', guardarContenido);
}

async function pedir(url, opciones = {}) {
  const respuesta = await fetch(url, opciones);
  let datos = null;

  try {
    datos = await respuesta.json();
  } catch {
    datos = null;
  }

  if (!respuesta.ok) {
    const detalles = datos && Array.isArray(datos.details) ? ` ${datos.details.join(' ')}` : '';
    throw new Error(`${(datos && datos.message) || 'Ocurrió un error inesperado.'}${detalles}`);
  }

  return datos;
}

async function cargarOpciones() {
  try {
    const [categorias, generos, plataformas] = await Promise.all([
      pedir(`${API}/categorias`),
      pedir(`${API}/generos`),
      pedir(`${API}/plataformas`)
    ]);

    estado.categorias = categorias.data;
    estado.generos = generos.data;
    estado.plataformas = plataformas.data;

    llenarSelect('filtroCategoria', estado.categorias.map((item) => item.nombre), 'Todas');
    llenarSelect('filtroGenero', estado.generos.map((item) => item.nombre), 'Todos');
    llenarSelect('filtroPlataforma', estado.plataformas.map((item) => item.nombre), 'Todas');
    llenarSelect('campoCategoria', estado.categorias, null, 'idCategoria');
    llenarSelect('campoGeneros', estado.generos, null, 'idGenero');
    llenarSelect('campoPlataformas', estado.plataformas, null, 'idPlataforma');
  } catch (error) {
    mostrarAlerta(`No se pudieron cargar los filtros. ${error.message}`);
  }
}

// Llena un <select>. Si recibe idCampo, el value es el id; si no, el nombre.
function llenarSelect(idSelect, valores, textoInicial, idCampo) {
  const select = document.getElementById(idSelect);

  if (textoInicial !== null) {
    select.innerHTML = `<option value="">${textoInicial}</option>`;
  } else {
    select.innerHTML = '';
  }

  valores.forEach((valor) => {
    const opcion = document.createElement('option');
    const esObjeto = valor !== null && typeof valor === 'object';

    opcion.value = esObjeto ? valor[idCampo] : valor;
    opcion.textContent = esObjeto ? valor.nombre : valor;
    select.appendChild(opcion);
  });
}

async function cargarEstadisticas() {
  try {
    const { data } = await pedir(`${API}/catalogo`);
    const peliculas = data.filter((item) => item.categoria === 'Película').length;
    const series = data.filter((item) => item.categoria === 'Serie').length;

    document.getElementById('statContenidos').textContent = data.length;
    document.getElementById('statPeliculas').textContent = peliculas;
    document.getElementById('statSeries').textContent = series;
  } catch (error) {
    mostrarAlerta(`No se pudieron cargar las estadísticas. ${error.message}`);
  }
}

async function cargarContenidos() {
  mostrarCargando(true);
  document.getElementById('sinResultados').classList.add('d-none');

  try {
    const parametros = new URLSearchParams();
    const titulo = document.getElementById('filtroTitulo').value.trim();
    const categoria = document.getElementById('filtroCategoria').value;
    const genero = document.getElementById('filtroGenero').value;
    const plataforma = document.getElementById('filtroPlataforma').value;
    const soloConTrailer = document.getElementById('filtroTrailer').checked;
    const orden = document.getElementById('filtroOrden').value;

    if (titulo) parametros.set('titulo', titulo);
    if (categoria) parametros.set('categoria', categoria);
    if (genero) parametros.set('genero', genero);
    if (plataforma) parametros.set('plataforma', plataforma);
    if (soloConTrailer) parametros.set('trailer', 'true');
    parametros.set('orden', orden);
    parametros.set('dir', 'asc');

    const { data } = await pedir(`${API}/contenidos?${parametros.toString()}`);
    estado.contenidos = data;
    renderizar(data);
  } catch (error) {
    estado.contenidos = [];
    renderizar([]);
    mostrarAlerta(error.message);
  } finally {
    mostrarCargando(false);
  }
}

function renderizar(lista) {
  const contenedor = document.getElementById('contenidos');
  contenedor.innerHTML = lista.map(tarjeta).join('');

  document.getElementById('sinResultados').classList.toggle('d-none', lista.length > 0);
  document.getElementById('contador').textContent =
    `${lista.length} resultado${lista.length === 1 ? '' : 's'}`;
}

function tarjeta(contenido) {
  const categoria = contenido.categoria ? contenido.categoria.nombre : 'Sin categoría';
  const claseCategoria = categoria === 'Serie' ? 'is-serie' : 'is-pelicula';
  const temporadas = contenido.temporadas > 0
    ? `${contenido.temporadas} temporada${contenido.temporadas === 1 ? '' : 's'}`
    : '';
  const generos = [...(contenido.generos || [])]
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    .map((genero) => `<span class="badge genre-badge me-1 mb-1">${escapeHtml(genero.nombre)}</span>`)
    .join('');
  const plataformas = [...(contenido.plataformas || [])]
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    .map((plataforma) => plataforma.nombre)
    .join(' · ');

  return `
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
      <article class="card content-card h-100 shadow-sm">
        <div class="card-top ${claseCategoria}">
          <span class="badge text-bg-light">${escapeHtml(categoria)}</span>
          <span class="seasons">${escapeHtml(temporadas)}</span>
        </div>
        <div class="card-body d-flex flex-column">
          <h2 class="card-title mb-2">${escapeHtml(contenido.titulo)}</h2>
          <div class="mb-2">${generos}</div>
          <p class="platforms-line mb-3">📺 ${escapeHtml(plataformas || 'Sin plataforma')}</p>
          <div class="mt-auto d-flex gap-2">
            <button type="button" class="btn btn-sm btn-dark flex-grow-1"
              data-accion="ver" data-id="${contenido.idContenido}">Detalle</button>
            <button type="button" class="btn btn-sm btn-outline-secondary"
              data-accion="editar" data-id="${contenido.idContenido}" title="Editar">✏️</button>
            <button type="button" class="btn btn-sm btn-outline-danger"
              data-accion="eliminar" data-id="${contenido.idContenido}" title="Eliminar">🗑️</button>
          </div>
        </div>
      </article>
    </div>`;
}

function manejarAccion(evento) {
  const boton = evento.target.closest('button[data-accion]');
  if (!boton) return;

  const contenido = estado.contenidos.find(
    (item) => item.idContenido === Number(boton.dataset.id)
  );
  if (!contenido) return;

  if (boton.dataset.accion === 'ver') abrirDetalle(contenido);
  if (boton.dataset.accion === 'editar') abrirFormulario(contenido);
  if (boton.dataset.accion === 'eliminar') eliminarContenido(contenido);
}

function abrirDetalle(contenido) {
  const categoria = contenido.categoria ? contenido.categoria.nombre : 'Sin categoría';
  const temporadas = contenido.temporadas > 0
    ? `${contenido.temporadas} temporada${contenido.temporadas === 1 ? '' : 's'}`
    : '';
  const trailer = contenido.trailer
    ? `<a class="btn btn-sm btn-danger" href="${escapeHtml(contenido.trailer)}"
         target="_blank" rel="noopener">▶ Ver trailer</a>`
    : '<span class="small text-white-50">Sin trailer disponible</span>';

  const chips = (items) => (items && items.length
    ? items.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join('')
    : '<span class="text-muted small">Sin datos</span>');

  document.getElementById('modalDetalleLabel').textContent = contenido.titulo;
  document.getElementById('detalleContenido').innerHTML = `
    <div class="detail-cover mb-3">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div>
          <div class="detail-label text-white-50">${escapeHtml(categoria)}</div>
          <h3 class="h4 mb-1">${escapeHtml(contenido.titulo)}</h3>
          ${temporadas ? `<div class="small text-white-50">${escapeHtml(temporadas)}</div>` : ''}
        </div>
        <div>${trailer}</div>
      </div>
    </div>
    <p class="mb-3">${escapeHtml(contenido.sinopsis)}</p>
    <div class="mb-2">
      <div class="detail-label">Géneros</div>
      ${chips((contenido.generos || []).map((genero) => genero.nombre))}
    </div>
    <div class="mb-2">
      <div class="detail-label">Plataformas</div>
      ${chips((contenido.plataformas || []).map((plataforma) => plataforma.nombre))}
    </div>
    <div>
      <div class="detail-label">Reparto</div>
      ${chips((contenido.reparto || []).map((actor) => actor.nombre))}
    </div>`;

  modalDetalle.show();
}

function abrirFormulario(contenido) {
  const formulario = document.getElementById('formContenido');
  formulario.reset();
  formulario.classList.remove('was-validated');
  document.getElementById('errorFormulario').classList.add('d-none');

  const tituloModal = document.getElementById('modalFormularioLabel');
  const campoId = document.getElementById('contenidoId');
  const campoCategoria = document.getElementById('campoCategoria');
  const campoGeneros = document.getElementById('campoGeneros');
  const campoPlataformas = document.getElementById('campoPlataformas');

  if (!contenido) {
    tituloModal.textContent = 'Nuevo contenido';
    campoId.value = '';
    campoCategoria.value = estado.categorias[0] ? String(estado.categorias[0].idCategoria) : '';
    Array.from(campoGeneros.options).forEach((opcion) => { opcion.selected = false; });
    Array.from(campoPlataformas.options).forEach((opcion) => { opcion.selected = false; });
  } else {
    tituloModal.textContent = 'Editar contenido';
    campoId.value = contenido.idContenido;
    document.getElementById('campoTitulo').value = contenido.titulo;
    document.getElementById('campoSinopsis').value = contenido.sinopsis;
    document.getElementById('campoTemporadas').value = contenido.temporadas;
    document.getElementById('campoTrailer').value = contenido.trailer || '';
    campoCategoria.value = String(contenido.idCategoria);

    const idsGeneros = (contenido.generos || []).map((genero) => String(genero.idGenero));
    const idsPlataformas = (contenido.plataformas || []).map((plataforma) => String(plataforma.idPlataforma));

    Array.from(campoGeneros.options).forEach((opcion) => {
      opcion.selected = idsGeneros.includes(opcion.value);
    });
    Array.from(campoPlataformas.options).forEach((opcion) => {
      opcion.selected = idsPlataformas.includes(opcion.value);
    });
  }

  modalFormulario.show();
}

async function guardarContenido(evento) {
  evento.preventDefault();

  const formulario = document.getElementById('formContenido');
  const cajaError = document.getElementById('errorFormulario');

  cajaError.classList.add('d-none');

  if (!formulario.checkValidity()) {
    formulario.classList.add('was-validated');
    return;
  }

  const id = document.getElementById('contenidoId').value;
  const boton = document.getElementById('btnGuardar');

  const datos = {
    titulo: document.getElementById('campoTitulo').value.trim(),
    sinopsis: document.getElementById('campoSinopsis').value.trim(),
    temporadas: Number(document.getElementById('campoTemporadas').value),
    trailer: document.getElementById('campoTrailer').value.trim() || null,
    idCategoria: Number(document.getElementById('campoCategoria').value),
    generos: Array.from(document.getElementById('campoGeneros').selectedOptions).map(
      (opcion) => Number(opcion.value)
    ),
    plataformas: Array.from(document.getElementById('campoPlataformas').selectedOptions).map(
      (opcion) => Number(opcion.value)
    )
  };

  boton.disabled = true;
  boton.textContent = 'Guardando...';

  try {
    const resultado = await pedir(id ? `${API}/contenidos/${id}` : `${API}/contenidos`, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    modalFormulario.hide();
    mostrarToast(resultado.message || 'Contenido guardado correctamente.');
    await Promise.all([cargarContenidos(), cargarEstadisticas()]);
  } catch (error) {
    cajaError.textContent = error.message;
    cajaError.classList.remove('d-none');
  } finally {
    boton.disabled = false;
    boton.textContent = 'Guardar';
  }
}

async function eliminarContenido(contenido) {
  const confirmado = window.confirm(`¿Eliminar "${contenido.titulo}" del catálogo?`);
  if (!confirmado) return;

  try {
    const resultado = await pedir(`${API}/contenidos/${contenido.idContenido}`, { method: 'DELETE' });
    mostrarToast(resultado.message || 'Contenido eliminado.');
    await Promise.all([cargarContenidos(), cargarEstadisticas()]);
  } catch (error) {
    mostrarAlerta(error.message);
  }
}

function mostrarCargando(visible) {
  document.getElementById('cargando').classList.toggle('d-none', !visible);
}

function mostrarAlerta(mensaje) {
  const contenedor = document.getElementById('alerta');
  contenedor.innerHTML = `
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      ${escapeHtml(mensaje)}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>`;
}

function mostrarToast(mensaje) {
  const contenedor = document.getElementById('toasts');
  const elemento = document.createElement('div');

  elemento.className = 'toast align-items-center text-bg-dark border-0';
  elemento.setAttribute('role', 'status');
  elemento.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${escapeHtml(mensaje)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast" aria-label="Cerrar"></button>
    </div>`;

  contenedor.appendChild(elemento);

  const toast = new bootstrap.Toast(elemento, { delay: 3200 });
  toast.show();
  elemento.addEventListener('hidden.bs.toast', () => elemento.remove());
}

function escapeHtml(valor) {
  return String(valor === undefined || valor === null ? '' : valor).replace(
    /[&<>"']/g,
    (caracter) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[caracter]
  );
}
