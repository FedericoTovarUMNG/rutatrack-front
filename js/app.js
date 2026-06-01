/* =========================
   RutaTrack - Lógica principal
   Integración Front-end con Back-end REST + SQLite
   ========================= */

let pedidosApi = [];
let repartidoresApi = [];
let pedidoSeleccionado = null;

/**
 * Inicializa la aplicación cuando el usuario inicia sesión.
 */
async function inicializarAplicacion() {
  await cargarDatosIniciales();
  renderDashboard();
  renderPedidos();
  renderRepartidores();
  renderSelectAsignaciones();
  await renderEventosRecientes();
}

/**
 * Carga pedidos y repartidores desde la API.
 */
async function cargarDatosIniciales() {
  pedidosApi = await apiListarPedidos();
  repartidoresApi = await apiListarRepartidores();
}

/**
 * Devuelve la clase CSS correspondiente al estado de un pedido.
 */
function obtenerClaseBadgePedido(estado) {
  const clases = {
    [ESTADOS_PEDIDO.PENDIENTE]: "badge-pendiente",
    [ESTADOS_PEDIDO.ASIGNADO]: "badge-asignado",
    [ESTADOS_PEDIDO.EN_TRANSITO]: "badge-transito",
    [ESTADOS_PEDIDO.ENTREGADO]: "badge-entregado",
    [ESTADOS_PEDIDO.CANCELADO]: "badge-cancelado"
  };

  return clases[estado] || "badge-asignado";
}

/**
 * Devuelve la clase CSS correspondiente al estado de un repartidor.
 */
function obtenerClaseBadgeRepartidor(estado) {
  const clases = {
    [ESTADOS_REPARTIDOR.DISPONIBLE]: "badge-disponible",
    [ESTADOS_REPARTIDOR.OCUPADO]: "badge-ocupado",
    [ESTADOS_REPARTIDOR.INACTIVO]: "badge-inactivo"
  };

  return clases[estado] || "badge-inactivo";
}

/**
 * Muestra mensajes simples de respuesta.
 */
function mostrarAlerta(mensaje, tipo = "info") {
  alert(`${tipo.toUpperCase()}: ${mensaje}`);
}

/**
 * Renderiza las tarjetas del dashboard.
 */
function renderDashboard() {
  const statsContainer = document.getElementById("stats-container");

  const totalPedidos = pedidosApi.length;
  const pedidosPendientes = pedidosApi.filter(
    (pedido) => pedido.estado === ESTADOS_PEDIDO.PENDIENTE
  ).length;
  const pedidosTransito = pedidosApi.filter(
    (pedido) => pedido.estado === ESTADOS_PEDIDO.EN_TRANSITO
  ).length;
  const pedidosEntregados = pedidosApi.filter(
    (pedido) => pedido.estado === ESTADOS_PEDIDO.ENTREGADO
  ).length;
  const repartidoresActivos = repartidoresApi.filter(
    (repartidor) => repartidor.estado !== ESTADOS_REPARTIDOR.INACTIVO
  ).length;

  statsContainer.innerHTML = `
    <article class="stat-card primary">
      <span>Total de pedidos</span>
      <strong>${totalPedidos}</strong>
    </article>

    <article class="stat-card warning">
      <span>Pedidos pendientes</span>
      <strong>${pedidosPendientes}</strong>
    </article>

    <article class="stat-card info">
      <span>Pedidos en tránsito</span>
      <strong>${pedidosTransito}</strong>
    </article>

    <article class="stat-card success">
      <span>Pedidos entregados</span>
      <strong>${pedidosEntregados}</strong>
    </article>

    <article class="stat-card primary">
      <span>Repartidores activos</span>
      <strong>${repartidoresActivos}</strong>
    </article>
  `;
}

/**
 * Renderiza eventos recientes del dashboard.
 */
async function renderEventosRecientes() {
  const recentEventsContainer = document.getElementById("recent-events");

  try {
    const pedidosConHistorial = await Promise.all(
      pedidosApi.slice(0, 5).map((pedido) => apiConsultarPedido(pedido.codigo))
    );

    const eventos = pedidosConHistorial
      .flatMap((pedido) =>
        pedido.historial.map((evento) => ({
          codigo: pedido.codigo,
          cliente: pedido.cliente,
          ...evento
        }))
      )
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);

    if (eventos.length === 0) {
      recentEventsContainer.innerHTML = `
        <p class="empty-state">No hay eventos recientes registrados.</p>
      `;
      return;
    }

    recentEventsContainer.innerHTML = `
      <div class="event-list">
        ${eventos
          .map(
            (evento) => `
            <div class="event-item">
              <strong>${evento.codigo} - ${evento.evento}</strong>
              <span>${evento.descripcion}</span><br />
              <span>${evento.fecha} | Cliente: ${evento.cliente}</span>
            </div>
          `
          )
          .join("")}
      </div>
    `;
  } catch (error) {
    recentEventsContainer.innerHTML = `
      <p class="empty-state">No fue posible cargar los eventos recientes.</p>
    `;
  }
}

/**
 * Renderiza la tabla de pedidos.
 */
function renderPedidos(lista = pedidosApi) {
  const ordersTableBody = document.getElementById("orders-table-body");

  if (lista.length === 0) {
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="8">
          <p class="empty-state">No se encontraron pedidos.</p>
        </td>
      </tr>
    `;
    return;
  }

  ordersTableBody.innerHTML = lista
    .map(
      (pedido) => `
        <tr>
          <td><strong>${pedido.codigo}</strong></td>
          <td>${pedido.cliente}</td>
          <td>${pedido.origen}</td>
          <td>${pedido.destino}</td>
          <td>
            <span class="badge ${obtenerClaseBadgePedido(pedido.estado)}">
              ${pedido.estado}
            </span>
          </td>
          <td>${pedido.prioridad}</td>
          <td>${pedido.repartidorNombre || "Sin asignar"}</td>
          <td>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-outline" onclick="verTrackingPedido('${pedido.codigo}')">
                Ver tracking
              </button>
    
              <button class="btn btn-outline" onclick="eliminarPedido(${pedido.id})">
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");
}

/**
 * Renderiza la tabla de repartidores.
 */
function renderRepartidores() {
  const driversTableBody = document.getElementById("drivers-table-body");

  driversTableBody.innerHTML = repartidoresApi
    .map(
      (repartidor) => `
      <tr>
        <td>${repartidor.id}</td>
        <td><strong>${repartidor.nombre}</strong></td>
        <td>${repartidor.telefono}</td>
        <td>${repartidor.vehiculo}</td>
        <td>${repartidor.capacidad} pedidos</td>
        <td>
          <span class="badge ${obtenerClaseBadgeRepartidor(repartidor.estado)}">
            ${repartidor.estado}
          </span>
        </td>
      </tr>
    `
    )
    .join("");
}

/**
 * Renderiza los selectores de asignación.
 */
function renderSelectAsignaciones() {
  const orderSelect = document.getElementById("assignment-order");
  const driverSelect = document.getElementById("assignment-driver");

  const pedidosPendientes = pedidosApi.filter(
    (pedido) => pedido.estado === ESTADOS_PEDIDO.PENDIENTE
  );

  const repartidoresDisponibles = repartidoresApi.filter(
    (repartidor) => repartidor.estado === ESTADOS_REPARTIDOR.DISPONIBLE
  );

  orderSelect.innerHTML = `
    <option value="">Seleccione un pedido</option>
    ${pedidosPendientes
      .map(
        (pedido) => `
        <option value="${pedido.id}">
          ${pedido.codigo} - ${pedido.cliente}
        </option>
      `
      )
      .join("")}
  `;

  driverSelect.innerHTML = `
    <option value="">Seleccione un repartidor</option>
    ${repartidoresDisponibles
      .map(
        (repartidor) => `
        <option value="${repartidor.id}">
          ${repartidor.nombre} - ${repartidor.vehiculo}
        </option>
      `
      )
      .join("")}
  `;
}

/**
 * Filtra pedidos consultando la API.
 */
async function filtrarPedidos() {
  const searchInput = document.getElementById("order-search");
  const statusFilter = document.getElementById("order-status-filter");

  const busqueda = searchInput.value.trim();
  const estado = statusFilter.value;

  try {
    const pedidosFiltrados = await apiListarPedidos(busqueda, estado);
    renderPedidos(pedidosFiltrados);
  } catch (error) {
    mostrarAlerta("No fue posible filtrar pedidos: " + error.message, "error");
  }
}

/**
 * Consulta y muestra el tracking de un pedido.
 */
async function verTrackingPedido(codigo) {
  try {
    pedidoSeleccionado = await apiConsultarPedido(codigo);
    renderTrackingPedido(pedidoSeleccionado);
    mostrarSeccion("tracking-section");
  } catch (error) {
    mostrarAlerta(error.message, "error");
  }
}

/**
 * Renderiza la vista de tracking.
 */
function renderTrackingPedido(pedido) {
  const trackingDetail = document.getElementById("tracking-detail");

  const progreso = {
    [ESTADOS_PEDIDO.PENDIENTE]: 10,
    [ESTADOS_PEDIDO.ASIGNADO]: 35,
    [ESTADOS_PEDIDO.EN_TRANSITO]: 70,
    [ESTADOS_PEDIDO.ENTREGADO]: 100,
    [ESTADOS_PEDIDO.CANCELADO]: 0
  };

  trackingDetail.innerHTML = `
    <div class="tracking-grid">
      <div>
        <h3>Pedido ${pedido.codigo}</h3>

        <div class="tracking-summary">
          <div class="summary-item">
            <span>Cliente</span>
            <strong>${pedido.cliente}</strong>
          </div>

          <div class="summary-item">
            <span>Estado actual</span>
            <strong>
              <span class="badge ${obtenerClaseBadgePedido(pedido.estado)}">
                ${pedido.estado}
              </span>
            </strong>
          </div>

          <div class="summary-item">
            <span>Origen</span>
            <strong>${pedido.origen}</strong>
          </div>

          <div class="summary-item">
            <span>Destino</span>
            <strong>${pedido.destino}</strong>
          </div>

          <div class="summary-item">
            <span>Repartidor</span>
            <strong>${pedido.repartidor ? pedido.repartidor.nombre : "Sin asignar"}</strong>
          </div>

          <div class="summary-item">
            <span>Prioridad</span>
            <strong>${pedido.prioridad}</strong>
          </div>
        </div>

        <div class="route-box">
          <h3>Ruta simulada</h3>
          <p>${pedido.origen} → ${pedido.destino}</p>

          <div class="route-line">
            <div class="route-point">A</div>
            <div class="route-progress">
              <div style="width: ${progreso[pedido.estado]}%"></div>
            </div>
            <div class="route-point">B</div>
          </div>
        </div>

        <br />

        ${
          pedido.estado !== ESTADOS_PEDIDO.ENTREGADO &&
          pedido.estado !== ESTADOS_PEDIDO.CANCELADO
            ? `
              <button class="btn btn-primary" onclick="avanzarEstadoPedido()">
                Avanzar estado
              </button>
            `
            : `
              <button class="btn btn-outline" disabled>
                Estado final alcanzado
              </button>
            `
        }
      </div>

      <div>
        <h3>Historial de eventos</h3>

        <div class="timeline">
          ${pedido.historial
            .map(
              (evento) => `
              <div class="timeline-item">
                <strong>${evento.evento}</strong>
                <span>${evento.descripcion}</span><br />
                <span>${evento.fecha}</span>
              </div>
            `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

/**
 * Avanza el estado de un pedido usando la API.
 */
async function avanzarEstadoPedido() {
  if (!pedidoSeleccionado) return;

  try {
    const respuesta = await apiAvanzarEstadoPedido(pedidoSeleccionado.id);

    pedidoSeleccionado = respuesta.data;

    await inicializarAplicacion();
    renderTrackingPedido(pedidoSeleccionado);

    mostrarAlerta(respuesta.message, "success");
  } catch (error) {
    mostrarAlerta(error.message, "error");
  }
}

/**
 * Crea un pedido nuevo usando la API.
 */
async function crearPedido(event) {
  event.preventDefault();

  if (!validarFormularioPedido()) {
    return;
  }

  const nuevoPedido = {
    codigo: document.getElementById("order-code").value.trim(),
    cliente: document.getElementById("order-client").value.trim(),
    origen: document.getElementById("order-origin").value.trim(),
    destino: document.getElementById("order-destination").value.trim(),
    descripcion: document.getElementById("order-description").value.trim(),
    prioridad: document.getElementById("order-priority").value
  };

  try {
    const respuesta = await apiCrearPedido(nuevoPedido);

    document.getElementById("order-form").reset();
    document.getElementById("order-form-container").classList.add("hidden");

    await inicializarAplicacion();

    mostrarAlerta(respuesta.message, "success");
  } catch (error) {
    mostrarAlerta(error.message, "error");
  }
}

/**
 * Elimina un pedido usando la API.
 */
async function eliminarPedido(pedidoId) {
  const confirmar = confirm(
    "¿Está seguro de eliminar este pedido? Esta acción también eliminará su historial."
  );

  if (!confirmar) {
    return;
  }

  try {
    const respuesta = await apiEliminarPedido(pedidoId);

    await inicializarAplicacion();

    const trackingDetail = document.getElementById("tracking-detail");
    if (trackingDetail) {
      trackingDetail.innerHTML = `
        <p class="empty-state">
          Seleccione un pedido desde la sección de pedidos para ver su tracking.
        </p>
      `;
    }

    mostrarAlerta(respuesta.message, "success");
  } catch (error) {
    mostrarAlerta(error.message, "error");
  }
}

/**
 * Asigna pedido a repartidor usando la API.
 */
async function asignarPedido(event) {
  event.preventDefault();

  const pedidoId = Number(document.getElementById("assignment-order").value);
  const repartidorId = Number(document.getElementById("assignment-driver").value);

  if (!pedidoId || !repartidorId) {
    mostrarAlerta("Debe seleccionar un pedido y un repartidor.", "error");
    return;
  }

  try {
    const respuesta = await apiAsignarPedido(pedidoId, repartidorId);

    document.getElementById("assignment-form").reset();

    await inicializarAplicacion();

    mostrarAlerta(respuesta.message, "success");
  } catch (error) {
    mostrarAlerta(error.message, "error");
  }
}

/**
 * Consulta de pedido para cliente.
 */
async function consultarPedidoCliente(event) {
  event.preventDefault();

  if (!validarConsultaCliente()) {
    return;
  }

  const codigo = document.getElementById("client-order-code").value.trim();
  const resultContainer = document.getElementById("client-result");

  try {
    const pedido = await apiConsultarPedido(codigo);

    resultContainer.classList.remove("hidden");
    resultContainer.innerHTML = `
      <h3>Resultado de consulta</h3>

      <div class="client-result-card">
        <div class="summary-item">
          <span>Código</span>
          <strong>${pedido.codigo}</strong>
        </div>

        <div class="summary-item">
          <span>Estado</span>
          <strong>
            <span class="badge ${obtenerClaseBadgePedido(pedido.estado)}">
              ${pedido.estado}
            </span>
          </strong>
        </div>

        <div class="summary-item">
          <span>Cliente</span>
          <strong>${pedido.cliente}</strong>
        </div>

        <div class="summary-item">
          <span>Repartidor</span>
          <strong>${pedido.repartidor ? pedido.repartidor.nombre : "Pendiente de asignación"}</strong>
        </div>

        <div class="summary-item">
          <span>Origen</span>
          <strong>${pedido.origen}</strong>
        </div>

        <div class="summary-item">
          <span>Destino</span>
          <strong>${pedido.destino}</strong>
        </div>
      </div>

      <br />

      <h3>Historial del pedido</h3>
      <div class="timeline">
        ${pedido.historial
          .map(
            (evento) => `
            <div class="timeline-item">
              <strong>${evento.evento}</strong>
              <span>${evento.descripcion}</span><br />
              <span>${evento.fecha}</span>
            </div>
          `
          )
          .join("")}
      </div>
    `;
  } catch (error) {
    resultContainer.classList.remove("hidden");
    resultContainer.innerHTML = `
      <div class="alert alert-error">
        ${error.message}
      </div>
    `;
  }
}

/**
 * Muestra u oculta formulario de nuevo pedido.
 */
function configurarFormularioPedido() {
  const showFormBtn = document.getElementById("show-order-form-btn");
  const cancelFormBtn = document.getElementById("cancel-order-form-btn");
  const formContainer = document.getElementById("order-form-container");
  const orderForm = document.getElementById("order-form");

  showFormBtn.addEventListener("click", () => {
    formContainer.classList.remove("hidden");
  });

  cancelFormBtn.addEventListener("click", () => {
    orderForm.reset();
    formContainer.classList.add("hidden");
  });

  orderForm.addEventListener("submit", crearPedido);
}

/**
 * Configura filtros de pedidos.
 */
function configurarFiltrosPedidos() {
  const searchInput = document.getElementById("order-search");
  const statusFilter = document.getElementById("order-status-filter");

  searchInput.addEventListener("input", filtrarPedidos);
  statusFilter.addEventListener("change", filtrarPedidos);
}

/**
 * Configura formularios principales.
 */
function configurarFormularios() {
  const assignmentForm = document.getElementById("assignment-form");
  const clientSearchForm = document.getElementById("client-search-form");

  assignmentForm.addEventListener("submit", asignarPedido);
  clientSearchForm.addEventListener("submit", consultarPedidoCliente);
}

/**
 * Punto inicial de la aplicación.
 */
document.addEventListener("DOMContentLoaded", () => {
  configurarLogin();
  configurarEventosNavegacion();
  configurarFormularioPedido();
  configurarFiltrosPedidos();
  configurarFormularios();
});