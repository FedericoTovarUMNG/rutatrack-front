const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "rutatrack.db");

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error("Error al conectar con SQLite:", error.message);
    return;
  }

  console.log("Base de datos SQLite conectada correctamente.");
});

db.serialize(() => {
  // Tabla de usuarios para autenticación básica
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      usuario TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      rol TEXT NOT NULL
    )
  `);

  // Tabla de repartidores
  db.run(`
    CREATE TABLE IF NOT EXISTS repartidores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      telefono TEXT NOT NULL,
      vehiculo TEXT NOT NULL,
      capacidad INTEGER NOT NULL,
      estado TEXT NOT NULL CHECK (estado IN ('Disponible', 'Ocupado', 'Inactivo'))
    )
  `);

  // Tabla de pedidos
  db.run(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      cliente TEXT NOT NULL,
      origen TEXT NOT NULL,
      destino TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      estado TEXT NOT NULL CHECK (estado IN ('Pendiente', 'Asignado', 'En tránsito', 'Entregado', 'Cancelado')),
      prioridad TEXT NOT NULL CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
      repartidor_id INTEGER,
      fecha_creacion TEXT NOT NULL,
      FOREIGN KEY (repartidor_id) REFERENCES repartidores(id)
    )
  `);

  // Tabla de historial de eventos
  db.run(`
    CREATE TABLE IF NOT EXISTS historial_eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER NOT NULL,
      evento TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      fecha TEXT NOT NULL,
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
    )
  `);

  insertarDatosIniciales();
});

/**
 * Ejecuta consultas con promesas.
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise}
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({
        id: this.lastID,
        changes: this.changes
      });
    });
  });
}

/**
 * Obtiene un solo registro.
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise}
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

/**
 * Obtiene múltiples registros.
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise}
 */
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

/**
 * Inserta datos iniciales si las tablas están vacías.
 */
async function insertarDatosIniciales() {
  try {
    const usuariosCount = await get("SELECT COUNT(*) AS total FROM usuarios");
    const repartidoresCount = await get("SELECT COUNT(*) AS total FROM repartidores");
    const pedidosCount = await get("SELECT COUNT(*) AS total FROM pedidos");

    if (usuariosCount.total === 0) {
      await run(`
        INSERT INTO usuarios (nombre, usuario, password, rol)
        VALUES 
          ('Administrador RutaTrack', 'admin', 'admin123', 'Administrador'),
          ('Operador Logístico', 'operador', 'operador123', 'Operador logístico'),
          ('Repartidor Demo', 'repartidor', 'repartidor123', 'Repartidor'),
          ('Cliente Demo', 'cliente', 'cliente123', 'Cliente')
      `);
    }

    if (repartidoresCount.total === 0) {
      await run(`
        INSERT INTO repartidores (nombre, telefono, vehiculo, capacidad, estado)
        VALUES
          ('Carlos Ramírez', '310 456 7890', 'Moto', 3, 'Ocupado'),
          ('María Fernanda López', '311 987 6543', 'Bicicleta', 2, 'Disponible'),
          ('Andrés Felipe Gómez', '320 654 9871', 'Camioneta', 8, 'Disponible'),
          ('Laura Daniela Torres', '315 222 3344', 'Moto', 3, 'Inactivo'),
          ('Juan Sebastián Rojas', '316 111 2233', 'Van', 6, 'Ocupado')
      `);
    }

    if (pedidosCount.total === 0) {
      await run(`
        INSERT INTO pedidos 
          (codigo, cliente, origen, destino, descripcion, estado, prioridad, repartidor_id, fecha_creacion)
        VALUES
          ('PED-001', 'Laura Gómez', 'Bodega Norte', 'Calle 80 # 45-20', 'Entrega de paquete mediano con documentos empresariales.', 'En tránsito', 'Alta', 1, '2026-05-10 08:00'),
          ('PED-002', 'Santiago Pérez', 'Centro de Distribución Principal', 'Carrera 15 # 93-40', 'Pedido de productos electrónicos pequeños.', 'Pendiente', 'Media', NULL, '2026-05-10 09:15'),
          ('PED-003', 'Camila Rodríguez', 'Bodega Sur', 'Avenida Boyacá # 26-10', 'Entrega de mercado y productos de consumo.', 'Asignado', 'Alta', 5, '2026-05-10 10:00'),
          ('PED-004', 'Daniel Martínez', 'Bodega Norte', 'Calle 127 # 18-25', 'Entrega programada de paquete pequeño.', 'Entregado', 'Baja', 1, '2026-05-09 14:30'),
          ('PED-005', 'Valentina Herrera', 'Sucursal Chapinero', 'Transversal 60 # 104-15', 'Entrega de paquete frágil.', 'Cancelado', 'Media', NULL, '2026-05-09 11:00')
      `);

      const pedidos = await all("SELECT id, codigo FROM pedidos");

      const pedido1 = pedidos.find((pedido) => pedido.codigo === "PED-001");
      const pedido2 = pedidos.find((pedido) => pedido.codigo === "PED-002");
      const pedido3 = pedidos.find((pedido) => pedido.codigo === "PED-003");
      const pedido4 = pedidos.find((pedido) => pedido.codigo === "PED-004");
      const pedido5 = pedidos.find((pedido) => pedido.codigo === "PED-005");

      await insertarEventoInicial(pedido1.id, "Pedido creado", "El pedido fue registrado en el sistema.", "2026-05-10 08:00");
      await insertarEventoInicial(pedido1.id, "Pedido asignado", "El pedido fue asignado al repartidor Carlos Ramírez.", "2026-05-10 08:25");
      await insertarEventoInicial(pedido1.id, "Pedido en tránsito", "El repartidor inició la ruta hacia el destino.", "2026-05-10 09:05");

      await insertarEventoInicial(pedido2.id, "Pedido creado", "El pedido fue registrado y está pendiente de asignación.", "2026-05-10 09:15");

      await insertarEventoInicial(pedido3.id, "Pedido creado", "El pedido fue registrado en el sistema.", "2026-05-10 10:00");
      await insertarEventoInicial(pedido3.id, "Pedido asignado", "El pedido fue asignado al repartidor Juan Sebastián Rojas.", "2026-05-10 10:20");

      await insertarEventoInicial(pedido4.id, "Pedido creado", "El pedido fue registrado en el sistema.", "2026-05-09 14:30");
      await insertarEventoInicial(pedido4.id, "Pedido asignado", "El pedido fue asignado al repartidor Carlos Ramírez.", "2026-05-09 14:45");
      await insertarEventoInicial(pedido4.id, "Pedido en tránsito", "El repartidor inició la ruta de entrega.", "2026-05-09 15:10");
      await insertarEventoInicial(pedido4.id, "Pedido entregado", "El pedido fue entregado correctamente al cliente.", "2026-05-09 16:05");

      await insertarEventoInicial(pedido5.id, "Pedido creado", "El pedido fue registrado en el sistema.", "2026-05-09 11:00");
      await insertarEventoInicial(pedido5.id, "Pedido cancelado", "El cliente solicitó la cancelación del pedido.", "2026-05-09 11:25");
    }

    console.log("Datos iniciales verificados correctamente.");
  } catch (error) {
    console.error("Error insertando datos iniciales:", error.message);
  }
}

/**
 * Inserta un evento inicial en el historial.
 */
async function insertarEventoInicial(pedidoId, evento, descripcion, fecha) {
  await run(
    `
      INSERT INTO historial_eventos (pedido_id, evento, descripcion, fecha)
      VALUES (?, ?, ?, ?)
    `,
    [pedidoId, evento, descripcion, fecha]
  );
}

module.exports = {
  db,
  run,
  get,
  all
};