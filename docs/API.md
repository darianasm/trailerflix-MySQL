# Documentación de la API — Trailerflix

API REST desarrollada con Node.js, Express, Sequelize y MySQL.

- **URL base:** `http://localhost:3000/api`
- **Formato:** JSON (`Content-Type: application/json`)
- **Base de datos:** `trailerflix` (8 tablas relacionadas)
- **Alias de compatibilidad:** las búsquedas `/catalogo`, `/titulo/:title`, `/categoria/:cat`, `/reparto/:act` y `/trailer/:id` también responden en la raíz del servidor (`http://localhost:3000/catalogo`, etc.).

---

## 1. Resumen de endpoints

| Método | Endpoint | Descripción | Códigos posibles |
| --- | --- | --- | --- |
| GET | `/contenidos` | Lista contenidos y permite filtros combinados. | 200, 400, 500 |
| GET | `/contenidos/:id` | Obtiene un contenido por id con todas sus relaciones. | 200, 400, 404, 500 |
| POST | `/contenidos` | Crea un contenido y sus relaciones. | 201, 400, 409, 500 |
| PUT | `/contenidos/:id` | Actualiza los campos enviados de un contenido. | 200, 400, 404, 409, 500 |
| DELETE | `/contenidos/:id` | Elimina un contenido y sus vínculos. | 200, 400, 404, 500 |
| GET | `/catalogo` | Catálogo resumido (título, categoría, géneros, reparto, plataformas, temporadas y trailer). | 200, 400, 500 |
| GET | `/titulo/:title` | Busca contenidos cuyo título contenga el texto indicado. | 200, 404, 500 |
| GET | `/categoria/:cat` | Busca contenidos por categoría (`Película` o `Serie`). | 200, 404, 500 |
| GET | `/reparto/:act` | Busca contenidos por actor o actriz. | 200, 404, 500 |
| GET | `/trailer/:id` | Devuelve el trailer del contenido indicado. | 200, 400, 404, 500 |
| GET | `/categorias` | Lista todas las categorías. | 200, 500 |
| GET | `/categorias/:id` | Obtiene una categoría por id. | 200, 400, 404, 500 |
| POST | `/categorias` | Crea una categoría. | 201, 400, 409, 500 |
| PUT | `/categorias/:id` | Actualiza una categoría. | 200, 400, 404, 409, 500 |
| DELETE | `/categorias/:id` | Elimina una categoría sin contenidos asociados. | 200, 400, 404, 409, 500 |
| GET | `/generos` | Lista todos los géneros. | 200, 500 |
| GET | `/generos/:id` | Obtiene un género por id. | 200, 400, 404, 500 |
| POST | `/generos` | Crea un género. | 201, 400, 409, 500 |
| PUT | `/generos/:id` | Actualiza un género. | 200, 400, 404, 409, 500 |
| DELETE | `/generos/:id` | Elimina un género y sus vínculos. | 200, 400, 404, 500 |
| GET | `/actores` | Lista todos los actores. | 200, 500 |
| GET | `/actores/:id` | Obtiene un actor por id. | 200, 400, 404, 500 |
| POST | `/actores` | Crea un actor. | 201, 400, 500 |
| PUT | `/actores/:id` | Actualiza un actor. | 200, 400, 404, 500 |
| DELETE | `/actores/:id` | Elimina un actor y sus vínculos. | 200, 400, 404, 500 |
| GET | `/plataformas` | Lista todas las plataformas. | 200, 500 |
| GET | `/plataformas/:id` | Obtiene una plataforma por id. | 200, 400, 404, 500 |
| POST | `/plataformas` | Crea una plataforma. | 201, 400, 409, 500 |
| PUT | `/plataformas/:id` | Actualiza una plataforma. | 200, 400, 404, 409, 500 |
| DELETE | `/plataformas/:id` | Elimina una plataforma y sus vínculos. | 200, 400, 404, 500 |
| GET | `/health` | Verifica el estado del servidor y de MySQL. | 200, 503 |

---

## 2. Filtros de `GET /api/contenidos` y `GET /api/catalogo`

Todos los filtros son opcionales y se pueden combinar en la misma consulta.

| Parámetro | Tipo | Ejemplo | Descripción |
| --- | --- | --- | --- |
| `titulo` | texto | `?titulo=crown` | Coincidencia parcial en el título. |
| `categoria` | texto | `?categoria=Serie` | Nombre exacto de la categoría. |
| `genero` | texto | `?genero=Drama,Crimen` | Uno o varios géneros separados por coma (coincide con cualquiera). |
| `plataforma` | texto | `?plataforma=Netflix,HBO Max` | Una o varias plataformas separadas por coma. |
| `actor` | texto | `?actor=Pascal` | Coincidencia parcial en el nombre del actor o actriz. |
| `temporadas` | entero | `?temporadas=5` | Cantidad exacta de temporadas (`0` para películas). |
| `trailer` | booleano | `?trailer=true` | `true` solo con trailer, `false` solo sin trailer. |
| `orden` | texto | `?orden=titulo` | Ordena por `id`, `titulo` o `temporadas`. Por defecto `id`. |
| `dir` | texto | `?dir=desc` | Dirección del orden: `asc` (por defecto) o `desc`. |

> Las búsquedas de texto no distinguen mayúsculas ni tildes, porque la base usa la colación `utf8mb4_unicode_ci`.

Ejemplo combinado:

```bash
curl "http://localhost:3000/api/contenidos?categoria=Serie&genero=Drama&plataforma=Netflix&temporadas=5&orden=titulo"
```

Respuesta `200 OK`:

```json
{
  "total": 1,
  "data": [
    {
      "idContenido": 19,
      "titulo": "Breaking Bad",
      "sinopsis": "Un profesor de química con una enfermedad terminal se asocia con un exalumno para fabricar metanfetamina y asegurar el futuro económico de su familia.",
      "temporadas": 5,
      "trailer": "https://www.youtube.com/results?search_query=Breaking+Bad+trailer+oficial",
      "idCategoria": 2,
      "categoria": { "idCategoria": 2, "nombre": "Serie" },
      "generos": [
        { "idGenero": 1, "nombre": "Drama" },
        { "idGenero": 4, "nombre": "Suspenso" },
        { "idGenero": 10, "nombre": "Crimen" }
      ],
      "reparto": [
        { "idActor": 87, "nombre": "Bryan Cranston" },
        { "idActor": 88, "nombre": "Aaron Paul" },
        { "idActor": 89, "nombre": "Anna Gunn" },
        { "idActor": 90, "nombre": "Dean Norris" },
        { "idActor": 91, "nombre": "Bob Odenkirk" }
      ],
      "plataformas": [
        { "idPlataforma": 1, "nombre": "Netflix", "imagen": "netflix.png" }
      ]
    }
  ]
}
```

Si ningún contenido cumple los filtros, la respuesta es `200 OK` con `{ "total": 0, "data": [] }`.

---

## 3. Contenidos

### 3.1 GET `/api/contenidos/:id`

Devuelve un contenido con su categoría, géneros, reparto y plataformas.

```bash
curl "http://localhost:3000/api/contenidos/1"
```

Respuesta `200 OK`:

```json
{
  "data": {
    "idContenido": 1,
    "titulo": "The Crown",
    "sinopsis": "Recorre el reinado de Isabel II desde su juventud, mostrando cómo la vida privada de la familia real choca con las obligaciones de la Corona y los grandes acontecimientos políticos del siglo XX.",
    "temporadas": 6,
    "trailer": "https://www.youtube.com/results?search_query=The+Crown+trailer+oficial",
    "idCategoria": 2,
    "categoria": { "idCategoria": 2, "nombre": "Serie" },
    "generos": [
      { "idGenero": 1, "nombre": "Drama" },
      { "idGenero": 2, "nombre": "Hechos verídicos" }
    ],
    "reparto": [
      { "idActor": 1, "nombre": "Claire Foy" },
      { "idActor": 2, "nombre": "Olivia Colman" },
      { "idActor": 3, "nombre": "Imelda Staunton" },
      { "idActor": 4, "nombre": "Matt Smith" },
      { "idActor": 5, "nombre": "Tobias Menzies" },
      { "idActor": 6, "nombre": "Vanessa Kirby" }
    ],
    "plataformas": [
      { "idPlataforma": 1, "nombre": "Netflix", "imagen": "netflix.png" }
    ]
  }
}
```

Errores posibles:

```json
{ "error": true, "status": 400, "message": "El id debe ser un número entero positivo." }
```

```json
{ "error": true, "status": 404, "message": "No se encontró el contenido con id 9999." }
```

### 3.2 POST `/api/contenidos`

Crea un contenido. Los campos `titulo`, `sinopsis`, `temporadas` e `idCategoria` son obligatorios. `generos`, `reparto` y `plataformas` son arrays opcionales de ids.

```bash
curl -X POST "http://localhost:3000/api/contenidos" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Nueva serie",
    "sinopsis": "Sinopsis de la nueva serie creada desde la API.",
    "temporadas": 2,
    "trailer": "https://www.youtube.com/watch?v=ejemplo",
    "idCategoria": 2,
    "generos": [1, 3],
    "reparto": [1, 7],
    "plataformas": [1, 3]
  }'
```

Respuesta `201 Created` (incluye el header `Location: /api/contenidos/31`):

```json
{
  "message": "Contenido creado correctamente.",
  "data": {
    "idContenido": 31,
    "titulo": "Nueva serie",
    "sinopsis": "Sinopsis de la nueva serie creada desde la API.",
    "temporadas": 2,
    "trailer": "https://www.youtube.com/watch?v=ejemplo",
    "idCategoria": 2,
    "categoria": { "idCategoria": 2, "nombre": "Serie" },
    "generos": [
      { "idGenero": 1, "nombre": "Drama" },
      { "idGenero": 3, "nombre": "Misterio" }
    ],
    "reparto": [
      { "idActor": 1, "nombre": "Claire Foy" },
      { "idActor": 7, "nombre": "KJ Apa" }
    ],
    "plataformas": [
      { "idPlataforma": 1, "nombre": "Netflix", "imagen": "netflix.png" },
      { "idPlataforma": 3, "nombre": "HBO Max", "imagen": "hbomax.png" }
    ]
  }
}
```

Error de validación `400 Bad Request`:

```json
{
  "error": true,
  "status": 400,
  "message": "Datos inválidos.",
  "details": [
    "La sinopsis es obligatoria.",
    "El campo 'temporadas' debe ser un entero mayor o igual a 0."
  ]
}
```

Si la categoría no existe: `400 Bad Request` con `"message": "La categoría con id 99 no existe."`

Si algún id de `generos`, `reparto` o `plataformas` no existe: `409 Conflict`. La creación se ejecuta dentro de una transacción, por lo que no queda ningún contenido incompleto si falla una relación.

### 3.3 PUT `/api/contenidos/:id`

Actualiza los campos enviados. Los campos que no se envían conservan su valor. Si se envían `generos`, `reparto` o `plataformas`, se reemplaza la lista completa de esa relación.

```bash
curl -X PUT "http://localhost:3000/api/contenidos/31" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Nueva serie - temporada 2",
    "temporadas": 3,
    "trailer": null,
    "generos": [1, 4]
  }'
```

Respuesta `200 OK`:

```json
{
  "message": "Contenido actualizado correctamente.",
  "data": {
    "idContenido": 31,
    "titulo": "Nueva serie - temporada 2",
    "sinopsis": "Sinopsis de la nueva serie creada desde la API.",
    "temporadas": 3,
    "trailer": null,
    "idCategoria": 2,
    "categoria": { "idCategoria": 2, "nombre": "Serie" },
    "generos": [
      { "idGenero": 1, "nombre": "Drama" },
      { "idGenero": 4, "nombre": "Suspenso" }
    ],
    "reparto": [
      { "idActor": 1, "nombre": "Claire Foy" },
      { "idActor": 7, "nombre": "KJ Apa" }
    ],
    "plataformas": [
      { "idPlataforma": 1, "nombre": "Netflix", "imagen": "netflix.png" },
      { "idPlataforma": 3, "nombre": "HBO Max", "imagen": "hbomax.png" }
    ]
  }
}
```

Si el body está vacío: `400 Bad Request` con `"message": "No se enviaron campos para actualizar."`

### 3.4 DELETE `/api/contenidos/:id`

Elimina el contenido y, por las claves foráneas con `ON DELETE CASCADE`, sus filas en las tablas intermedias.

```bash
curl -X DELETE "http://localhost:3000/api/contenidos/31"
```

Respuesta `200 OK`:

```json
{ "message": "Contenido \"Nueva serie - temporada 2\" eliminado correctamente." }
```

Si no existe: `404 Not Found`.

---

## 4. Búsquedas heredadas de la primera preentrega

### 4.1 GET `/api/catalogo`

Devuelve el catálogo en formato resumido. Acepta los mismos filtros que `/api/contenidos`.

```bash
curl "http://localhost:3000/api/catalogo?titulo=crown"
```

Respuesta `200 OK`:

```json
{
  "total": 1,
  "data": [
    {
      "id": 1,
      "titulo": "The Crown",
      "categoria": "Serie",
      "generos": ["Drama", "Hechos verídicos"],
      "reparto": ["Claire Foy", "Olivia Colman", "Imelda Staunton", "Matt Smith", "Tobias Menzies", "Vanessa Kirby"],
      "plataformas": ["Netflix"],
      "temporadas": 6,
      "trailer": "https://www.youtube.com/results?search_query=The+Crown+trailer+oficial"
    }
  ]
}
```

### 4.2 GET `/api/titulo/:title`

Busca en el título sin distinguir mayúsculas ni tildes.

```bash
curl "http://localhost:3000/api/titulo/GUASON"
```

Respuesta `200 OK`:

```json
{
  "total": 1,
  "data": [
    {
      "id": 7,
      "titulo": "Guasón",
      "categoria": "Película",
      "generos": ["Drama", "Crimen", "Suspenso"],
      "reparto": ["Joaquin Phoenix", "Robert De Niro", "Zazie Beetz", "Frances Conroy"],
      "plataformas": ["HBO Max", "Amazon Prime"],
      "temporadas": 0,
      "trailer": "https://www.youtube.com/results?search_query=Guason+Joker+trailer+oficial"
    }
  ]
}
```

Si no hay coincidencias: `404 Not Found` con `"message": "No se encontraron títulos que contengan \"...\"."`

### 4.3 GET `/api/categoria/:cat`

```bash
curl "http://localhost:3000/api/categoria/Serie?genero=Comedia"
```

Respuesta `200 OK` (resumida):

```json
{
  "total": 3,
  "data": [
    {
      "id": 20,
      "titulo": "Merlina",
      "categoria": "Serie",
      "generos": ["Misterio", "Comedia", "Fantasía"],
      "reparto": ["Jenna Ortega", "Catherine Zeta-Jones", "Luis Guzmán", "Emma Myers", "Gwendoline Christie"],
      "plataformas": ["Netflix"],
      "temporadas": 2,
      "trailer": "https://www.youtube.com/results?search_query=Merlina+Wednesday+trailer+oficial"
    }
  ]
}
```

### 4.4 GET `/api/reparto/:act`

Devuelve el título y el reparto de los contenidos en los que participa el actor o actriz buscado.

```bash
curl "http://localhost:3000/api/reparto/Pascal"
```

Respuesta `200 OK`:

```json
{
  "total": 1,
  "data": [
    {
      "id": 3,
      "titulo": "The Mandalorian",
      "reparto": ["Pedro Pascal", "Gina Carano", "Giancarlo Esposito", "Carl Weathers", "Katee Sackhoff"]
    }
  ]
}
```

### 4.5 GET `/api/trailer/:id`

```bash
curl "http://localhost:3000/api/trailer/1"
```

Respuesta `200 OK`:

```json
{
  "data": {
    "id": 1,
    "titulo": "The Crown",
    "trailer": "https://www.youtube.com/results?search_query=The+Crown+trailer+oficial"
  }
}
```

Si el contenido existe pero no tiene trailer: `404 Not Found` con `"message": "El contenido \"Gambito de Dama\" no tiene trailer disponible."`

---

## 5. Categorías

### GET `/api/categorias`

```bash
curl "http://localhost:3000/api/categorias"
```

```json
{
  "total": 2,
  "data": [
    { "idCategoria": 1, "nombre": "Película" },
    { "idCategoria": 2, "nombre": "Serie" }
  ]
}
```

### GET `/api/categorias/:id`

```bash
curl "http://localhost:3000/api/categorias/1"
```

```json
{ "data": { "idCategoria": 1, "nombre": "Película" } }
```

### POST `/api/categorias`

```bash
curl -X POST "http://localhost:3000/api/categorias" \
  -H "Content-Type: application/json" \
  -d '{ "nombre": "Documental" }'
```

Respuesta `201 Created`:

```json
{
  "message": "Se creó la categoría correctamente.",
  "data": { "idCategoria": 3, "nombre": "Documental" }
}
```

Si el nombre ya existe: `409 Conflict` con `"message": "Ya existe un registro con ese nombre."`

### PUT `/api/categorias/:id`

```bash
curl -X PUT "http://localhost:3000/api/categorias/3" \
  -H "Content-Type: application/json" \
  -d '{ "nombre": "Documentales" }'
```

```json
{
  "message": "Se actualizó la categoría correctamente.",
  "data": { "idCategoria": 3, "nombre": "Documentales" }
}
```

### DELETE `/api/categorias/:id`

```bash
curl -X DELETE "http://localhost:3000/api/categorias/3"
```

```json
{ "message": "Se eliminó la categoría correctamente." }
```

Si la categoría tiene contenidos asociados: `409 Conflict` con `"message": "No se puede completar la operación porque el registro está relacionado con otros datos."`

---

## 6. Géneros

### GET `/api/generos`

```bash
curl "http://localhost:3000/api/generos"
```

```json
{
  "total": 14,
  "data": [
    { "idGenero": 1, "nombre": "Drama" },
    { "idGenero": 2, "nombre": "Hechos verídicos" },
    { "idGenero": 3, "nombre": "Misterio" }
  ]
}
```

### GET `/api/generos/:id`

```bash
curl "http://localhost:3000/api/generos/1"
```

```json
{ "data": { "idGenero": 1, "nombre": "Drama" } }
```

### POST `/api/generos`

```bash
curl -X POST "http://localhost:3000/api/generos" \
  -H "Content-Type: application/json" \
  -d '{ "nombre": "Documental" }'
```

```json
{
  "message": "Se creó el género correctamente.",
  "data": { "idGenero": 15, "nombre": "Documental" }
}
```

### PUT `/api/generos/:id`

```bash
curl -X PUT "http://localhost:3000/api/generos/15" \
  -H "Content-Type: application/json" \
  -d '{ "nombre": "Documentales" }'
```

```json
{
  "message": "Se actualizó el género correctamente.",
  "data": { "idGenero": 15, "nombre": "Documentales" }
}
```

### DELETE `/api/generos/:id`

```bash
curl -X DELETE "http://localhost:3000/api/generos/15"
```

```json
{ "message": "Se eliminó el género correctamente." }
```

Al eliminar un género, las filas de `contenido_genero` se borran por `ON DELETE CASCADE`.

---

## 7. Actores

### GET `/api/actores`

```bash
curl "http://localhost:3000/api/actores"
```

```json
{
  "total": 136,
  "data": [
    { "idActor": 1, "nombre": "Claire Foy" },
    { "idActor": 2, "nombre": "Olivia Colman" }
  ]
}
```

### GET `/api/actores/:id`

```bash
curl "http://localhost:3000/api/actores/1"
```

```json
{ "data": { "idActor": 1, "nombre": "Claire Foy" } }
```

### POST `/api/actores`

```bash
curl -X POST "http://localhost:3000/api/actores" \
  -H "Content-Type: application/json" \
  -d '{ "nombre": "Actor de prueba" }'
```

```json
{
  "message": "Se creó el actor correctamente.",
  "data": { "idActor": 137, "nombre": "Actor de prueba" }
}
```

### PUT `/api/actores/:id`

```bash
curl -X PUT "http://localhost:3000/api/actores/137" \
  -H "Content-Type: application/json" \
  -d '{ "nombre": "Actor actualizado" }'
```

```json
{
  "message": "Se actualizó el actor correctamente.",
  "data": { "idActor": 137, "nombre": "Actor actualizado" }
}
```

### DELETE `/api/actores/:id`

```bash
curl -X DELETE "http://localhost:3000/api/actores/137"
```

```json
{ "message": "Se eliminó el actor correctamente." }
```

---

## 8. Plataformas

### GET `/api/plataformas`

```bash
curl "http://localhost:3000/api/plataformas"
```

```json
{
  "total": 4,
  "data": [
    { "idPlataforma": 1, "nombre": "Netflix", "imagen": "netflix.png" },
    { "idPlataforma": 2, "nombre": "Disney+", "imagen": "disney.png" },
    { "idPlataforma": 3, "nombre": "HBO Max", "imagen": "hbomax.png" },
    { "idPlataforma": 4, "nombre": "Amazon Prime", "imagen": "prime.png" }
  ]
}
```

### GET `/api/plataformas/:id`

```bash
curl "http://localhost:3000/api/plataformas/1"
```

```json
{ "data": { "idPlataforma": 1, "nombre": "Netflix", "imagen": "netflix.png" } }
```

### POST `/api/plataformas`

```bash
curl -X POST "http://localhost:3000/api/plataformas" \
  -H "Content-Type: application/json" \
  -d '{ "nombre": "Star+", "imagen": "star.png" }'
```

```json
{
  "message": "Se creó la plataforma correctamente.",
  "data": { "idPlataforma": 5, "nombre": "Star+", "imagen": "star.png" }
}
```

### PUT `/api/plataformas/:id`

```bash
curl -X PUT "http://localhost:3000/api/plataformas/5" \
  -H "Content-Type: application/json" \
  -d '{ "imagen": "starplus.png" }'
```

```json
{
  "message": "Se actualizó la plataforma correctamente.",
  "data": { "idPlataforma": 5, "nombre": "Star+", "imagen": "starplus.png" }
}
```

### DELETE `/api/plataformas/:id`

```bash
curl -X DELETE "http://localhost:3000/api/plataformas/5"
```

```json
{ "message": "Se eliminó la plataforma correctamente." }
```

---

## 9. Estado del servidor

### GET `/api/health`

```bash
curl "http://localhost:3000/api/health"
```

```json
{
  "status": "ok",
  "database": "trailerflix",
  "timestamp": "2026-11-15T16:46:12.140Z"
}
```

Si MySQL no responde: `503 Service Unavailable` con `"message": "No se pudo conectar con la base de datos."`

---

## 10. Formato de errores y códigos de estado

Todos los errores respetan esta estructura:

```json
{
  "error": true,
  "status": 400,
  "message": "Descripción general del error.",
  "details": ["Detalle opcional del problema."]
}
```

| Código | Significado | Ejemplo en la API |
| --- | --- | --- |
| `200 OK` | Consulta o modificación exitosa. | Listados, actualizaciones y eliminaciones. |
| `201 Created` | Recurso creado. | `POST /api/contenidos`. |
| `400 Bad Request` | Datos o parámetros inválidos. | `temporadas: "dos"`, id no numérico, body vacío. |
| `404 Not Found` | Recurso o ruta inexistente. | `GET /api/contenidos/9999`. |
| `409 Conflict` | Conflicto con datos existentes o relacionados. | Nombre duplicado, categoría con contenidos. |
| `500 Internal Server Error` | Error inesperado del servidor. | Falla de conexión durante una consulta. |
| `503 Service Unavailable` | Servicio no disponible. | MySQL caído al consultar `/api/health`. |

Ejemplos de errores:

```json
{
  "error": true,
  "status": 404,
  "message": "Ruta no encontrada: GET /api/no-existe"
}
```

```json
{
  "error": true,
  "status": 400,
  "message": "El parámetro 'trailer' solo acepta los valores true o false."
}
```

```json
{
  "error": true,
  "status": 409,
  "message": "No se puede completar la operación porque el registro está relacionado con otros datos."
}
```

---

## 11. Interfaz web de prueba

La página `http://localhost:3000` consume estos mismos endpoints y permite:

- Filtrar por título, categoría, género, plataforma y disponibilidad de trailer.
- Ver el detalle de cada contenido, incluidos reparto y plataformas.
- Crear un contenido.
- Editar un contenido.
- Eliminar un contenido con confirmación.

No es una aplicación independiente: usa `fetch` contra `/api` y sirve como demostración visual de la API.
