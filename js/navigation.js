/* =========================
   RutaTrack - Navegacion
   Control de pantallas y sesion simulada
   ========================= */

// Informacion de sesion simulada
let usuarioActual = {
  nombre: "",
  rol: ""
};

// Títulos y subtítulos por seccion
const sectionInfo = {
  "dashboard-section": {
    title: "Dashboard",
    subtitle: "Resumen general del sistema logístico"
  },
  "orders-section": {
    title: "Gestion de pedidos",
    subtitle: "Listado, creacion, búsqueda y filtrado de pedidos"
  },
  "tracking-section": {
    title: "Tracking",
    subtitle: "Seguimiento del estado, ruta e historial de eventos"
  },
  "drivers-section": {
    title: "Repartidores",
    subtitle: "Gestion visual de disponibilidad y capacidad operativa"
  },
  "assignments-section": {
    title: "Asignaciones",
    subtitle: "Asignacion de pedidos pendientes a repartidores disponibles"
  },
  "client-section": {
    title: "Consulta cliente",
    subtitle: "Consulta pública del estado de un pedido por codigo"
  }
};

/**
 * Inicia sesion de forma simulada.
 * No se implementa autenticacion real en esta fase.
 */
function iniciarSesionSimulada() {
  const usernameInput = document.getElementById("username");
  const roleInput = document.getElementById("user-role");

  usuarioActual.nombre = usernameInput.value.trim();
  usuarioActual.rol = roleInput.value;

  document.getElementById("current-user").textContent = usuarioActual.nombre;
  document.getElementById("current-role").textContent = usuarioActual.rol;

  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  aplicarPermisosPorRol(usuarioActual.rol);
  mostrarSeccion("dashboard-section");
}

/**
 * Cierra la sesion simulada y vuelve al login.
 */
function cerrarSesionSimulada() {
  usuarioActual = {
    nombre: "",
    rol: ""
  };

  document.getElementById("login-form").reset();

  document.getElementById("app").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");

  mostrarSeccion("dashboard-section");
}

/**
 * Muestra una seccion específica y oculta las demás.
 * @param {string} sectionId
 */
function mostrarSeccion(sectionId) {
  const sections = document.querySelectorAll(".content-section");
  const menuItems = document.querySelectorAll(".menu-item");

  sections.forEach((section) => {
    section.classList.remove("active-section");
  });

  menuItems.forEach((item) => {
    item.classList.remove("active");
  });

  const selectedSection = document.getElementById(sectionId);
  const selectedMenuItem = document.querySelector(
    `.menu-item[data-section="${sectionId}"]`
  );

  if (selectedSection) {
    selectedSection.classList.add("active-section");
  }

  if (selectedMenuItem) {
    selectedMenuItem.classList.add("active");
  }

  actualizarTituloSeccion(sectionId);
}

/**
 * Actualiza el título y subtítulo superior según la seccion activa.
 * @param {string} sectionId
 */
function actualizarTituloSeccion(sectionId) {
  const pageTitle = document.getElementById("page-title");
  const pageSubtitle = document.getElementById("page-subtitle");

  const info = sectionInfo[sectionId];

  if (!info) return;

  pageTitle.textContent = info.title;
  pageSubtitle.textContent = info.subtitle;
}

/**
 * Aplica una visibilidad básica de opciones según el rol seleccionado.
 * Esta funcion simula control de acceso visual en front-end.
 * @param {string} rol
 */
function aplicarPermisosPorRol(rol) {
  const menuItems = document.querySelectorAll(".menu-item");

  menuItems.forEach((item) => {
    item.classList.remove("hidden");
  });

  if (rol === "Cliente") {
    ocultarMenuItem("orders-section");
    ocultarMenuItem("drivers-section");
    ocultarMenuItem("assignments-section");
    ocultarMenuItem("dashboard-section");
    ocultarMenuItem("tracking-section");

    mostrarSeccion("client-section");
  }

  if (rol === "Repartidor") {
    ocultarMenuItem("drivers-section");
    ocultarMenuItem("assignments-section");
    ocultarMenuItem("client-section");
  }

  if (rol === "Operador logístico") {
    ocultarMenuItem("client-section");
  }

  if (rol === "Administrador") {
    // El administrador puede ver todos los modulos.
  }
}

/**
 * Oculta un boton del menú por ID de seccion.
 * @param {string} sectionId
 */
function ocultarMenuItem(sectionId) {
  const item = document.querySelector(`.menu-item[data-section="${sectionId}"]`);

  if (item) {
    item.classList.add("hidden");
  }
}

/**
 * Configura los eventos de navegacion del menú.
 */
function configurarEventosNavegacion() {
  const menuItems = document.querySelectorAll(".menu-item");

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      const sectionId = item.dataset.section;
      mostrarSeccion(sectionId);
    });
  });

  const logoutBtn = document.getElementById("logout-btn");

  logoutBtn.addEventListener("click", () => {
    cerrarSesionSimulada();
  });
}

/**
 * Configura el evento del login.
 */
function configurarLogin() {
  const loginForm = document.getElementById("login-form");

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validarLogin()) {
      return;
    }

    iniciarSesionSimulada();

    if (typeof inicializarAplicacion === "function") {
      inicializarAplicacion();
    }
  });
}