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

## Instalación y ejecución del proyecto

### 1. Clonar o descargar el proyecto

Ubicarse en la carpeta principal del proyecto.

### 2. Entrar a la carpeta del back-end

cd backend

### 3. Instalar dependencias

npm.cmd install

O si se usa CMD/Git Bash:

npm install

### 4. Ejecutar el servidor

npm.cmd run dev

O:

npm run dev

El servidor se ejecuta en:

http://localhost:3000

### 5. Probar API

Abrir en el navegador:

http://localhost:3000/api/health

### 6. Abrir el front-end

Abrir el archivo:

index.html

Luego iniciar sesión con uno de los usuarios de prueba.

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