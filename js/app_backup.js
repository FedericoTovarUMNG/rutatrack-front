/* =========================
   RutaTrack - Logica principal
   Renderizado e interaccion de la aplicacion
   ========================= */

/**
 * Inicializa la aplicacion cuando el usuario inicia sesion.
 */
function inicializarAplicacion() {
  renderDashboard();
  renderPedidos();
  renderRepartidores();
  renderSelectAsignaciones();
  renderEventosRecientes();
}

/**
 * Devuelve la clase CSS correspondiente al estado de un pedido.
 * @param {string} estado
 * @returns {string}
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
 * @param {string} estado
 * @returns {string}
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
 * Renderiza las tarjetas del dashboard.
 */
function renderDashboard() {
  const statsContainer = document.getElementById("stats-container");

  const totalPedidos = pedidos.length;
  const pedidosPendientes = pedidos.filter(
    (pedido) => pedido.estado === ESTADOS_PEDIDO.PENDIENTE
  ).length;
  const pedidosTransito = pedidos.filter(
    (pedido) => pedido.estado === ESTADOS_PEDIDO.EN_TRANSITO
  ).length;
  const pedidosEntregados = pedidos.filter(
    (pedido) => pedido.estado === ESTADOS_PEDIDO.ENTREGADO
  ).length;
  const repartidoresActivos = repartidores.filter(
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
 * Renderiza los eventos recientes del dashboard.
 */
function renderEventosRecientes() {
  const recentEventsContainer = document.getElementById("recent-events");

  const eventos = pedidos
    .flatMap((pedido) =>
      pedido.historial.map((evento) => ({
        codigo: pedido.codigo,
        cliente: pedido.cliente,
        ...evento
      }))
    )
    .slice(-5)
    .reverse();

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
}

/**
 * Renderiza la tabla de pedidos usando búsqueda y filtro.
 */
function renderPedidos() {
  const ordersTableBody = document.getElementById("orders-table-body");
  const searchInput = document.getElementById("order-search");
  const statusFilter = document.getElementById("order-status-filter");

  const busqueda = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const estadoSeleccionado = statusFilter ? statusFilter.value : "Todos";

  let pedidosFiltrados = pedidos.filter((pedido) => {
    const coincideBusqueda =
      pedido.codigo.toLowerCase().includes(busqueda) ||
      pedido.cliente.toLowerCase().includes(busqueda);

    const coincideEstado =
      estadoSeleccionado === "Todos" || pedido.estado === estadoSeleccionado;

    return coincideBusqueda && coincideEstado;
  });

  if (pedidosFiltrados.length === 0) {
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="8">
          <p class="empty-state">No se encontraron pedidos con los filtros aplicados.</p>
        </td>
      </tr>
    `;
    return;
  }

  ordersTableBody.innerHTML = pedidosFiltrados
    .map((pedido) => {
      const repartidor = obtenerRepartidorPorId(pedido.repartidorId);

      return `
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
          <td>${repartidor ? repartidor.nombre : "Sin asignar"}</td>
          <td>
            <button class="btn btn-outline" onclick="verTrackingPedido('${pedido.codigo}')">
              Ver tracking
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

/**
 * Renderiza la tabla de repartidores.
 */
function renderRepartidores() {
  const driversTableBody = document.getElementById("drivers-table-body");

  driversTableBody.innerHTML = repartidores
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
 * Renderiza los selectores de pedidos pendientes y repartidores disponibles.
 */
function renderSelectAsignaciones() {
  const orderSelect = document.getElementById("assignment-order");
  const driverSelect = document.getElementById("assignment-driver");

  const pedidosPendientes = pedidos.filter(
    (pedido) => pedido.estado === ESTADOS_PEDIDO.PENDIENTE
  );

  const repartidoresDisponibles = repartidores.filter(
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
 * Muestra el detalle y tracking de un pedido.
 * @param {string} codigo
 */
function verTrackingPedido(codigo) {
  const pedido = obtenerPedidoPorCodigo(codigo);

  if (!pedido) return;

  renderTrackingPedido(pedido);
  mostrarSeccion("tracking-section");
}

/**
 * Renderiza la vista de tracking de un pedido.
 * @param {object} pedido
 */
function renderTrackingPedido(pedido) {
  const trackingDetail = document.getElementById("tracking-detail");
  const repartidor = obtenerRepartidorPorId(pedido.repartidorId);

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
            <strong>${repartidor ? repartidor.nombre : "Sin asignar"}</strong>
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
            <div class="route-progress"></div>
            <div class="route-point">B</div>
          </div>
        </div>

        <br />

        <button class="btn btn-primary" onclick="avanzarEstadoPedido('${pedido.codigo}')">
          Avanzar estado
        </button>
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
 * Avanza el estado de un pedido de forma simulada.
 * @param {string} codigo
 */
function avanzarEstadoPedido(codigo) {
  const pedido = obtenerPedidoPorCodigo(codigo);

  if (!pedido) return;

  if (pedido.estado === ESTADOS_PEDIDO.CANCELADO) {
    alert("No se puede avanzar un pedido cancelado.");
    return;
  }

  if (pedido.estado === ESTADOS_PEDIDO.ENTREGADO) {
    alert("Este pedido ya fue entregado.");
    return;
  }

  if (pedido.estado === ESTADOS_PEDIDO.PENDIENTE) {
    alert("Primero debe asignarse un repartidor al pedido.");
    return;
  }

  if (pedido.estado === ESTADOS_PEDIDO.ASIGNADO) {
    pedido.estado = ESTADOS_PEDIDO.EN_TRANSITO;
    pedido.historial.push({
      evento: "Pedido en tránsito",
      descripcion: "El repartidor inicio la ruta hacia el destino.",
      fecha: obtenerFechaActualSimulada()
    });
  } else if (pedido.estado === ESTADOS_PEDIDO.EN_TRANSITO) {
    pedido.estado = ESTADOS_PEDIDO.ENTREGADO;
    pedido.historial.push({
      evento: "Pedido entregado",
      descripcion: "El pedido fue entregado correctamente al cliente.",
      fecha: obtenerFechaActualSimulada()
    });

    if (pedido.repartidorId) {
      const repartidor = obtenerRepartidorPorId(pedido.repartidorId);
      if (repartidor) {
        repartidor.estado = ESTADOS_REPARTIDOR.DISPONIBLE;
      }
    }
  }

  renderTrackingPedido(pedido);
  inicializarAplicacion();
}

/**
 * Crea un nuevo pedido desde el formulario.
 * @param {Event} event
 */
function crearPedido(event) {
  event.preventDefault();

  if (!validarFormularioPedido()) {
    return;
  }

  const nuevoPedido = {
    id: generarNuevoPedidoId(),
    codigo: document.getElementById("order-code").value.trim(),
    cliente: document.getElementById("order-client").value.trim(),
    origen: document.getElementById("order-origin").value.trim(),
    destino: document.getElementById("order-destination").value.trim(),
    descripcion: document.getElementById("order-description").value.trim(),
    estado: ESTADOS_PEDIDO.PENDIENTE,
    prioridad: document.getElementById("order-priority").value,
    repartidorId: null,
    fechaCreacion: obtenerFechaActualSimulada(),
    historial: [
      {
        evento: "Pedido creado",
        descripcion: "El pedido fue registrado y está pendiente de asignacion.",
        fecha: obtenerFechaActualSimulada()
      }
    ]
  };

  pedidos.push(nuevoPedido);

  document.getElementById("order-form").reset();
  document.getElementById("order-form-container").classList.add("hidden");

  inicializarAplicacion();

  alert("Pedido creado correctamente.");
}

/**
 * Asigna un pedido pendiente a un repartidor disponible.
 * @param {Event} event
 */
function asignarPedido(event) {
  event.preventDefault();

  if (!validarFormularioAsignacion()) {
    return;
  }

  const pedidoId = Number(document.getElementById("assignment-order").value);
  const repartidorId = Number(document.getElementById("assignment-driver").value);

  const pedido = pedidos.find((item) => item.id === pedidoId);
  const repartidor = repartidores.find((item) => item.id === repartidorId);

  if (!pedido || !repartidor) return;

  pedido.repartidorId = repartidor.id;
  pedido.estado = ESTADOS_PEDIDO.ASIGNADO;

  repartidor.estado = ESTADOS_REPARTIDOR.OCUPADO;

  pedido.historial.push({
    evento: "Pedido asignado",
    descripcion: `El pedido fue asignado al repartidor ${repartidor.nombre}.`,
    fecha: obtenerFechaActualSimulada()
  });

  document.getElementById("assignment-form").reset();

  inicializarAplicacion();

  alert("Pedido asignado correctamente.");
}

/**
 * Consulta el estado de un pedido desde la pantalla del cliente.
 * @param {Event} event
 */
function consultarPedidoCliente(event) {
  event.preventDefault();

  if (!validarConsultaCliente()) {
    return;
  }

  const codigo = document.getElementById("client-order-code").value.trim();
  const pedido = obtenerPedidoPorCodigo(codigo);
  const resultContainer = document.getElementById("client-result");

  if (!pedido) {
    resultContainer.classList.remove("hidden");
    resultContainer.innerHTML = `
      <div class="alert alert-error">
        No se encontro ningún pedido con el codigo ingresado.
      </div>
    `;
    return;
  }

  const repartidor = obtenerRepartidorPorId(pedido.repartidorId);

  resultContainer.classList.remove("hidden");
  resultContainer.innerHTML = `
    <h3>Resultado de consulta</h3>

    <div class="client-result-card">
      <div class="summary-item">
        <span>Codigo</span>
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
        <strong>${repartidor ? repartidor.nombre : "Pendiente de asignacion"}</strong>
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
}

/**
 * Muestra u oculta el formulario de nuevo pedido.
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
 * Configura filtros y búsqueda de pedidos.
 */
function configurarFiltrosPedidos() {
  const searchInput = document.getElementById("order-search");
  const statusFilter = document.getElementById("order-status-filter");

  searchInput.addEventListener("input", renderPedidos);
  statusFilter.addEventListener("change", renderPedidos);
}

/**
 * Configura los formularios principales.
 */
function configurarFormularios() {
  const assignmentForm = document.getElementById("assignment-form");
  const clientSearchForm = document.getElementById("client-search-form");

  assignmentForm.addEventListener("submit", asignarPedido);
  clientSearchForm.addEventListener("submit", consultarPedidoCliente);
}

/**
 * Punto inicial de la aplicacion.
 */
document.addEventListener("DOMContentLoaded", () => {
  configurarLogin();
  configurarEventosNavegacion();
  configurarFormularioPedido();
  configurarFiltrosPedidos();
  configurarFormularios();
});