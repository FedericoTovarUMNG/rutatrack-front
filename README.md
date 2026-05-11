# RutaTrack - Sistema de seguimiento de pedidos y rutas

## Autor

Federico Alejandro Tovar Prada
Universidad Militar Nueva Granada
Asignatura: Ingeniería Web
Fase 2: Implementacion del Front-end

## Descripcion del proyecto

RutaTrack es una aplicacion web front-end desarrollada como parte de la Fase 2 de la asignatura Ingeniería Web.

El sistema permite simular la gestion, asignacion y seguimiento de pedidos mediante una interfaz web funcional. La aplicacion trabaja con datos mock en JavaScript, por lo tanto no requiere conexion a una base de datos ni a un back-end real en esta fase.

## Caso de estudio

El caso de estudio corresponde a una aplicacion web para el seguimiento de pedidos, rutas, repartidores y tracking.

El sistema permite:

- Gestionar pedidos.
- Consultar pedidos registrados.
- Asignar pedidos pendientes a repartidores disponibles.
- Visualizar el tracking de un pedido.
- Consultar historial de eventos.
- Gestionar visualmente repartidores.
- Consultar el estado de un pedido desde una vista de cliente.
- Simular control de acceso por roles.

## Roles simulados

La aplicacion cuenta con acceso simulado para los siguientes roles:

- Administrador.
- Operador logístico.
- Repartidor.
- Cliente.

Este acceso no corresponde a autenticacion real, sino a una simulacion de navegacion y permisos visuales para fines académicos.

## Tecnologías utilizadas

- HTML5.
- CSS3.
- JavaScript.
- Datos mock en JavaScript.
- Diseño responsive mediante CSS y media queries.

## Estructura del proyecto

rutatrack-front/
│
├── index.html
├── README.md
│
├── css/
│   └── styles.css
│
├── js/
│   ├── data.js
│   ├── app.js
│   ├── navigation.js
│   └── validations.js
│
└── assets/
    └── img/

## Enlace de GitHub Pages:

https://federicotovarumng.github.io/rutatrack-front/