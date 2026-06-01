/* =========================
   RutaTrack - Cliente API
   Comunicación Front-end con Back-end REST
   ========================= */

const API_BASE_URL = "http://localhost:3000/api";

/**
 * Procesa respuestas HTTP de la API.
 * @param {Response} response
 * @returns {Promise<object>}
 */
async function procesarRespuesta(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error en la solicitud al servidor.");
  }

  return data;
}

/**
 * Login básico contra el back-end.
 * @param {string} usuario
 * @param {string} password
 * @returns {Promise<object>}
 */
async function apiLogin(usuario, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ usuario, password })
  });

  return procesarRespuesta(response);
}

/**
 * Lista pedidos desde la API.
 * @param {string} search
 * @param {string} estado
 * @returns {Promise<Array>}
 */
async function apiListarPedidos(search = "", estado = "Todos") {
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (estado && estado !== "Todos") params.append("estado", estado);

  const response = await fetch(`${API_BASE_URL}/pedidos?${params.toString()}`);
  const result = await procesarRespuesta(response);

  return result.data;
}

/**
 * Consulta un pedido por código.
 * @param {string} codigo
 * @returns {Promise<object>}
 */
async function apiConsultarPedido(codigo) {
  const response = await fetch(`${API_BASE_URL}/pedidos/${encodeURIComponent(codigo)}`);
  const result = await procesarRespuesta(response);

  return result.data;
}

/**
 * Crea un nuevo pedido.
 * @param {object} pedido
 * @returns {Promise<object>}
 */
async function apiCrearPedido(pedido) {
  const response = await fetch(`${API_BASE_URL}/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(pedido)
  });

  return procesarRespuesta(response);
}

/**
 * Lista repartidores desde la API.
 * @returns {Promise<Array>}
 */
async function apiListarRepartidores() {
  const response = await fetch(`${API_BASE_URL}/repartidores`);
  const result = await procesarRespuesta(response);

  return result.data;
}

/**
 * Asigna un pedido a un repartidor.
 * @param {number} pedidoId
 * @param {number} repartidorId
 * @returns {Promise<object>}
 */
async function apiAsignarPedido(pedidoId, repartidorId) {
  const response = await fetch(`${API_BASE_URL}/asignaciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ pedidoId, repartidorId })
  });

  return procesarRespuesta(response);
}

/**
 * Avanza el estado de un pedido.
 * @param {number} pedidoId
 * @returns {Promise<object>}
 */
async function apiAvanzarEstadoPedido(pedidoId) {
  const response = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}/avanzar-estado`, {
    method: "PUT"
  });

  return procesarRespuesta(response);
}

/**
 * Elimina un pedido por ID.
 * @param {number} pedidoId
 * @returns {Promise<object>}
 */
async function apiEliminarPedido(pedidoId) {
  const response = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}`, {
    method: "DELETE"
  });

  return procesarRespuesta(response);
}