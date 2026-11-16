// Rutas de la API JSON. Se usan para decidir si un error se responde como
// JSON o como página HTML.
const PREFIJOS_API = [
  '/contenidos',
  '/categorias',
  '/generos',
  '/actores',
  '/plataformas',
  '/health',
  '/catalogo',
  '/titulo',
  '/categoria',
  '/reparto',
  '/trailer'
];

function esRutaApi(req) {
  return PREFIJOS_API.some(
    (prefijo) => req.path === prefijo || req.path.startsWith(`${prefijo}/`)
  );
}

module.exports = { esRutaApi };
