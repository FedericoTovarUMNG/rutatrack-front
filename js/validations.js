/* =========================
   RutaTrack - Validaciones
   Validacion de formularios e interfaz
   ========================= */

/**
 * Limpia un mensaje de error y remueve el estilo de error del campo.
 * @param {HTMLElement} input
 * @param {HTMLElement} errorElement
 */
function limpiarError(input, errorElement) {
  if (input) {
    input.classList.remove("input-error");
  }

  if (errorElement) {
    errorElement.textContent = "";
  }
}

/**
 * Muestra un mensaje de error en un campo.
 * @param {HTMLElement} input
 * @param {HTMLElement} errorElement
 * @param {string} message
 */
function mostrarError(input, errorElement, message) {
  if (input) {
    input.classList.add("input-error");
  }

  if (errorElement) {
    errorElement.textContent = message;
  }
}

/**
 * Valida que un valor no esté vacío.
 * @param {string} value
 * @returns {boolean}
 */
function esCampoRequerido(value) {
  return value.trim().length > 0;
}

/**
 * Valida el formulario de login simulado.
 * @returns {boolean}
 */
function validarLogin() {
  const usernameInput = document.getElementById("username");
  const roleInput = document.getElementById("user-role");

  const usernameError = document.getElementById("username-error");
  const roleError = document.getElementById("role-error");

  let esValido = true;

  limpiarError(usernameInput, usernameError);
  limpiarError(roleInput, roleError);

  if (!esCampoRequerido(usernameInput.value)) {
    mostrarError(
      usernameInput,
      usernameError,
      "El nombre de usuario es obligatorio."
    );
    esValido = false;
  }

  if (!esCampoRequerido(roleInput.value)) {
    mostrarError(roleInput, roleError, "Debe seleccionar un rol de acceso.");
    esValido = false;
  }

  return esValido;
}

/**
 * Valida el formulario de creacion de pedido.
 * @returns {boolean}
 */
function validarFormularioPedido() {
  const codeInput = document.getElementById("order-code");
  const clientInput = document.getElementById("order-client");
  const originInput = document.getElementById("order-origin");
  const destinationInput = document.getElementById("order-destination");
  const priorityInput = document.getElementById("order-priority");
  const descriptionInput = document.getElementById("order-description");

  const codeError = document.getElementById("order-code-error");
  const clientError = document.getElementById("order-client-error");
  const originError = document.getElementById("order-origin-error");
  const destinationError = document.getElementById("order-destination-error");
  const priorityError = document.getElementById("order-priority-error");
  const descriptionError = document.getElementById("order-description-error");

  let esValido = true;

  limpiarError(codeInput, codeError);
  limpiarError(clientInput, clientError);
  limpiarError(originInput, originError);
  limpiarError(destinationInput, destinationError);
  limpiarError(priorityInput, priorityError);
  limpiarError(descriptionInput, descriptionError);

  if (!esCampoRequerido(codeInput.value)) {
    mostrarError(codeInput, codeError, "El codigo del pedido es obligatorio.");
    esValido = false;
  } else if (obtenerPedidoPorCodigo(codeInput.value)) {
    mostrarError(codeInput, codeError, "Ya existe un pedido con este codigo.");
    esValido = false;
  }

  if (!esCampoRequerido(clientInput.value)) {
    mostrarError(clientInput, clientError, "El nombre del cliente es obligatorio.");
    esValido = false;
  }

  if (!esCampoRequerido(originInput.value)) {
    mostrarError(originInput, originError, "La direccion de origen es obligatoria.");
    esValido = false;
  }

  if (!esCampoRequerido(destinationInput.value)) {
    mostrarError(
      destinationInput,
      destinationError,
      "La direccion de destino es obligatoria."
    );
    esValido = false;
  }

  if (
    esCampoRequerido(originInput.value) &&
    esCampoRequerido(destinationInput.value) &&
    originInput.value.trim().toLowerCase() ===
      destinationInput.value.trim().toLowerCase()
  ) {
    mostrarError(
      destinationInput,
      destinationError,
      "El origen y el destino no pueden ser iguales."
    );
    esValido = false;
  }

  if (!esCampoRequerido(priorityInput.value)) {
    mostrarError(priorityInput, priorityError, "Debe seleccionar una prioridad.");
    esValido = false;
  }

  if (!esCampoRequerido(descriptionInput.value)) {
    mostrarError(
      descriptionInput,
      descriptionError,
      "La descripcion del pedido es obligatoria."
    );
    esValido = false;
  } else if (descriptionInput.value.trim().length < 5) {
    mostrarError(
      descriptionInput,
      descriptionError,
      "La descripcion debe tener al menos 5 caracteres."
    );
    esValido = false;
  }

  return esValido;
}

/**
 * Valida el formulario de asignacion de pedidos.
 * @returns {boolean}
 */
function validarFormularioAsignacion() {
  const orderInput = document.getElementById("assignment-order");
  const driverInput = document.getElementById("assignment-driver");

  const orderError = document.getElementById("assignment-order-error");
  const driverError = document.getElementById("assignment-driver-error");

  let esValido = true;

  limpiarError(orderInput, orderError);
  limpiarError(driverInput, driverError);

  if (!esCampoRequerido(orderInput.value)) {
    mostrarError(orderInput, orderError, "Debe seleccionar un pedido pendiente.");
    esValido = false;
  }

  if (!esCampoRequerido(driverInput.value)) {
    mostrarError(driverInput, driverError, "Debe seleccionar un repartidor disponible.");
    esValido = false;
  } else {
    const repartidorSeleccionado = repartidores.find(
      (repartidor) => repartidor.id === Number(driverInput.value)
    );

    if (
      !repartidorSeleccionado ||
      repartidorSeleccionado.estado !== ESTADOS_REPARTIDOR.DISPONIBLE
    ) {
      mostrarError(
        driverInput,
        driverError,
        "Solo se pueden asignar pedidos a repartidores disponibles."
      );
      esValido = false;
    }
  }

  return esValido;
}

/**
 * Valida la consulta de pedido por parte del cliente.
 * @returns {boolean}
 */
function validarConsultaCliente() {
  const codeInput = document.getElementById("client-order-code");
  const codeError = document.getElementById("client-order-code-error");

  let esValido = true;

  limpiarError(codeInput, codeError);

  if (!esCampoRequerido(codeInput.value)) {
    mostrarError(
      codeInput,
      codeError,
      "Debe ingresar el codigo del pedido."
    );
    esValido = false;
  }

  return esValido;
}