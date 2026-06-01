const express = require("express");
const cors = require("cors");
const { run, get, all } = require("./database");

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// =========================
// Utilidades
// =========================

function obtenerFechaActual() {
  const fecha = new Date();

  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");

  return `${anio}-${mes}-${dia} ${horas}:${minutos}`;
}

function validarCampo(valor) {
  return typeof valor === "string" && valor.trim().length > 0;
}

async function obtenerPedidoCompletoPorId(id) {
  const pedido = await get(
    `
      SELECT 
        p.id,
        p.codigo,
        p.cliente,
        p.origen,
        p.destino,
        p.descripcion,
        p.estado,
        p.prioridad,
        p.repartidor_id AS repartidorId,
        p.fecha_creacion AS fechaCreacion,
        r.nombre AS repartidorNombre,
        r.telefono AS repartidorTelefono,
        r.vehiculo AS repartidorVehiculo
      FROM pedidos p
      LEFT JOIN repartidores r ON p.repartidor_id = r.id
      WHERE p.id = ?
    `,
    [id]
  );

  if (!pedido) return null;

  const historial = await all(
    `
      SELECT id, evento, descripcion, fecha
      FROM historial_eventos
      WHERE pedido_id = ?
      ORDER BY id ASC
    `,
    [id]
  );

  return {
    ...pedido,
    historial,
    repartidor: pedido.repartidorId
      ? {
          id: pedido.repartidorId,
          nombre: pedido.repartidorNombre,
          telefono: pedido.repartidorTelefono,
          vehiculo: pedido.repartidorVehiculo
        }
      : null
  };
}

async function obtenerPedidoCompletoPorCodigo(codigo) {
  const pedido = await get(
    `
      SELECT id
      FROM pedidos
      WHERE LOWER(codigo) = LOWER(?)
    `,
    [codigo]
  );

  if (!pedido) return null;

  return obtenerPedidoCompletoPorId(pedido.id);
}

// =========================
// Ruta de salud
// =========================

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API RutaTrack funcionando correctamente",
    database: "SQLite conectada",
    timestamp: new Date().toISOString()
  });
});

// =========================
// Autenticación básica
// =========================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!validarCampo(usuario) || !validarCampo(password)) {
      return res.status(400).json({
        success: false,
        message: "Usuario y contraseña son obligatorios."
      });
    }

    const user = await get(
      `
        SELECT id, nombre, usuario, rol
        FROM usuarios
        WHERE usuario = ? AND password = ?
      `,
      [usuario.trim(), password.trim()]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas."
      });
    }

    res.json({
      success: true,
      message: "Inicio de sesión exitoso.",
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno durante el inicio de sesión.",
      error: error.message
    });
  }
});

// =========================
// Pedidos
// =========================

app.get("/api/pedidos", async (req, res) => {
  try {
    const { search = "", estado = "Todos" } = req.query;

    let sql = `
      SELECT 
        p.id,
        p.codigo,
        p.cliente,
        p.origen,
        p.destino,
        p.descripcion,
        p.estado,
        p.prioridad,
        p.repartidor_id AS repartidorId,
        p.fecha_creacion AS fechaCreacion,
        r.nombre AS repartidorNombre
      FROM pedidos p
      LEFT JOIN repartidores r ON p.repartidor_id = r.id
      WHERE 1 = 1
    `;

    const params = [];

    if (search.trim() !== "") {
      sql += `
        AND (
          LOWER(p.codigo) LIKE LOWER(?)
          OR LOWER(p.cliente) LIKE LOWER(?)
        )
      `;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (estado !== "Todos") {
      sql += " AND p.estado = ?";
      params.push(estado);
    }

    sql += " ORDER BY p.id DESC";

    const pedidos = await all(sql, params);

    res.json({
      success: true,
      data: pedidos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al listar pedidos.",
      error: error.message
    });
  }
});

app.get("/api/pedidos/:codigo", async (req, res) => {
  try {
    const { codigo } = req.params;

    const pedido = await obtenerPedidoCompletoPorCodigo(codigo);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado."
      });
    }

    res.json({
      success: true,
      data: pedido
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al consultar pedido.",
      error: error.message
    });
  }
});

app.post("/api/pedidos", async (req, res) => {
  try {
    const {
      codigo,
      cliente,
      origen,
      destino,
      descripcion,
      prioridad
    } = req.body;

    if (
      !validarCampo(codigo) ||
      !validarCampo(cliente) ||
      !validarCampo(origen) ||
      !validarCampo(destino) ||
      !validarCampo(descripcion) ||
      !validarCampo(prioridad)
    ) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos del pedido son obligatorios."
      });
    }

    if (origen.trim().toLowerCase() === destino.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "El origen y el destino no pueden ser iguales."
      });
    }

    if (!["Alta", "Media", "Baja"].includes(prioridad)) {
      return res.status(400).json({
        success: false,
        message: "La prioridad ingresada no es válida."
      });
    }

    const pedidoExistente = await get(
      "SELECT id FROM pedidos WHERE LOWER(codigo) = LOWER(?)",
      [codigo.trim()]
    );

    if (pedidoExistente) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un pedido con este código."
      });
    }

    const fecha = obtenerFechaActual();

    const resultado = await run(
      `
        INSERT INTO pedidos
          (codigo, cliente, origen, destino, descripcion, estado, prioridad, repartidor_id, fecha_creacion)
        VALUES (?, ?, ?, ?, ?, 'Pendiente', ?, NULL, ?)
      `,
      [
        codigo.trim(),
        cliente.trim(),
        origen.trim(),
        destino.trim(),
        descripcion.trim(),
        prioridad,
        fecha
      ]
    );

    await run(
      `
        INSERT INTO historial_eventos (pedido_id, evento, descripcion, fecha)
        VALUES (?, ?, ?, ?)
      `,
      [
        resultado.id,
        "Pedido creado",
        "El pedido fue registrado y está pendiente de asignación.",
        fecha
      ]
    );

    const pedidoCreado = await obtenerPedidoCompletoPorId(resultado.id);

    res.status(201).json({
      success: true,
      message: "Pedido creado correctamente.",
      data: pedidoCreado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear pedido.",
      error: error.message
    });
  }
});

app.delete("/api/pedidos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await get("SELECT * FROM pedidos WHERE id = ?", [id]);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado."
      });
    }

    if (pedido.repartidor_id && pedido.estado !== "Entregado") {
      await run("UPDATE repartidores SET estado = 'Disponible' WHERE id = ?", [
        pedido.repartidor_id
      ]);
    }

    await run("DELETE FROM historial_eventos WHERE pedido_id = ?", [id]);
    await run("DELETE FROM pedidos WHERE id = ?", [id]);
    
    res.json({
      success: true,
      message: "Pedido eliminado correctamente."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar pedido.",
      error: error.message
    });
  }
});

// =========================
// Repartidores
// =========================

app.get("/api/repartidores", async (req, res) => {
  try {
    const repartidores = await all(
      `
        SELECT id, nombre, telefono, vehiculo, capacidad, estado
        FROM repartidores
        ORDER BY id ASC
      `
    );

    res.json({
      success: true,
      data: repartidores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al listar repartidores.",
      error: error.message
    });
  }
});

// =========================
// Asignaciones
// =========================

app.post("/api/asignaciones", async (req, res) => {
  try {
    const { pedidoId, repartidorId } = req.body;

    if (!pedidoId || !repartidorId) {
      return res.status(400).json({
        success: false,
        message: "Debe seleccionar un pedido y un repartidor."
      });
    }

    const pedido = await get("SELECT * FROM pedidos WHERE id = ?", [pedidoId]);
    const repartidor = await get("SELECT * FROM repartidores WHERE id = ?", [
      repartidorId
    ]);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado."
      });
    }

    if (!repartidor) {
      return res.status(404).json({
        success: false,
        message: "Repartidor no encontrado."
      });
    }

    if (pedido.estado !== "Pendiente") {
      return res.status(400).json({
        success: false,
        message: "Solo se pueden asignar pedidos en estado Pendiente."
      });
    }

    if (repartidor.estado !== "Disponible") {
      return res.status(400).json({
        success: false,
        message: "Solo se pueden asignar pedidos a repartidores disponibles."
      });
    }

    const fecha = obtenerFechaActual();

    await run(
      `
        UPDATE pedidos
        SET repartidor_id = ?, estado = 'Asignado'
        WHERE id = ?
      `,
      [repartidorId, pedidoId]
    );

    await run(
      `
        UPDATE repartidores
        SET estado = 'Ocupado'
        WHERE id = ?
      `,
      [repartidorId]
    );

    await run(
      `
        INSERT INTO historial_eventos (pedido_id, evento, descripcion, fecha)
        VALUES (?, ?, ?, ?)
      `,
      [
        pedidoId,
        "Pedido asignado",
        `El pedido fue asignado al repartidor ${repartidor.nombre}.`,
        fecha
      ]
    );

    const pedidoActualizado = await obtenerPedidoCompletoPorId(pedidoId);

    res.json({
      success: true,
      message: "Pedido asignado correctamente.",
      data: pedidoActualizado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al asignar pedido.",
      error: error.message
    });
  }
});

// =========================
// Tracking / Avanzar estado
// =========================

app.put("/api/pedidos/:id/avanzar-estado", async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await get("SELECT * FROM pedidos WHERE id = ?", [id]);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado."
      });
    }

    if (pedido.estado === "Cancelado") {
      return res.status(400).json({
        success: false,
        message: "No se puede avanzar un pedido cancelado."
      });
    }

    if (pedido.estado === "Entregado") {
      return res.status(400).json({
        success: false,
        message: "Este pedido ya fue entregado."
      });
    }

    if (pedido.estado === "Pendiente") {
      return res.status(400).json({
        success: false,
        message: "Primero debe asignarse un repartidor al pedido."
      });
    }

    let nuevoEstado = "";
    let evento = "";
    let descripcion = "";

    if (pedido.estado === "Asignado") {
      nuevoEstado = "En tránsito";
      evento = "Pedido en tránsito";
      descripcion = "El repartidor inició la ruta hacia el destino.";
    }

    if (pedido.estado === "En tránsito") {
      nuevoEstado = "Entregado";
      evento = "Pedido entregado";
      descripcion = "El pedido fue entregado correctamente al cliente.";
    }

    const fecha = obtenerFechaActual();

    await run("UPDATE pedidos SET estado = ? WHERE id = ?", [nuevoEstado, id]);

    await run(
      `
        INSERT INTO historial_eventos (pedido_id, evento, descripcion, fecha)
        VALUES (?, ?, ?, ?)
      `,
      [id, evento, descripcion, fecha]
    );

    if (nuevoEstado === "Entregado" && pedido.repartidor_id) {
      await run("UPDATE repartidores SET estado = 'Disponible' WHERE id = ?", [
        pedido.repartidor_id
      ]);
    }

    const pedidoActualizado = await obtenerPedidoCompletoPorId(id);

    res.json({
      success: true,
      message: "Estado del pedido actualizado correctamente.",
      data: pedidoActualizado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al avanzar estado.",
      error: error.message
    });
  }
});

// =========================
// Manejo de rutas no encontradas
// =========================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada."
  });
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor RutaTrack ejecutándose en http://localhost:${PORT}`);
});