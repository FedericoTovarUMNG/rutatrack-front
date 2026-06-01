# RutaTrack - Sistema de seguimiento de pedidos y rutas

## Autor

Federico Alejandro Tovar Prada  
Universidad Militar Nueva Granada  
Asignatura: Ingeniería Web  
Actividad 3: Implementación del Back-end, integración con Front-end y base de datos

---

## Descripción del proyecto

RutaTrack es una aplicación web desarrollada para el caso de estudio de seguimiento de pedidos, rutas, repartidores y tracking.

En esta fase se implementó una aplicación web funcional integrada por:

- Front-end con HTML5, CSS3 y JavaScript.
- Back-end con Node.js y Express.
- API REST para la comunicación entre capas.
- Base de datos SQLite para persistencia.
- Autenticación básica por usuario y contraseña.
- Operaciones CRUD sobre pedidos.
- Lógica de negocio para asignaciones, estados e historial de tracking.

El sistema permite gestionar pedidos, asignarlos a repartidores disponibles, consultar el historial de eventos y realizar seguimiento del estado del pedido.

---

## Caso de estudio

El caso de estudio corresponde a una aplicación web para el seguimiento de:

- Pedidos.
- Rutas.
- Repartidores.
- Tracking.
- Historial de eventos.
- Consulta de estado por parte del cliente.

---

## Tecnologías utilizadas

### Front-end

- HTML5.
- CSS3.
- JavaScript.
- Fetch API.
- Diseño responsive mediante CSS y media queries.

### Back-end

- Node.js.
- Express.
- CORS.
- SQLite3.
- Nodemon para desarrollo.

### Base de datos

- SQLite.
- Archivo local: `backend/rutatrack.db`.

---

## Estructura del proyecto

```text
rutatrack-front/
│
├── index.html
├── README.md
│
├── css/
│   └── styles.css
│
├── js/
│   ├── api.js
│   ├── app.js
│   ├── data.js
│   ├── navigation.js
│   └── validations.js
│
├── assets/
│
└── backend/
    ├── database.js
    ├── package.json
    ├── package-lock.json
    ├── rutatrack.db
    └── server.js