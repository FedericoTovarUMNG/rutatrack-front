/* =========================
   RutaTrack - Datos mock
   Simulacion de pedidos, repartidores e historial
   ========================= */

// Estados disponibles para los pedidos
const ESTADOS_PEDIDO = {
  PENDIENTE: "Pendiente",
  ASIGNADO: "Asignado",
  EN_TRANSITO: "En tránsito",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado"
};

// Estados disponibles para repartidores
const ESTADOS_REPARTIDOR = {
  DISPONIBLE: "Disponible",
  OCUPADO: "Ocupado",
  INACTIVO: "Inactivo"
};

// Datos simulados de repartidores
let repartidores = [
  {
    id: 1,
    nombre: "Carlos Ramírez",
    telefono: "310 456 7890",
    vehiculo: "Moto",
    capacidad: 3,
    estado: ESTADOS_REPARTIDOR.OCUPADO
  },
  {
    id: 2,
    nombre: "María Fernanda Lopez",
    telefono: "311 987 6543",
    vehiculo: "Bicicleta",
    capacidad: 2,
    estado: ESTADOS_REPARTIDOR.DISPONIBLE
  },
  {
    id: 3,
    nombre: "Andrés Felipe Gomez",
    telefono: "320 654 9871",
    vehiculo: "Camioneta",
    capacidad: 8,
    estado: ESTADOS_REPARTIDOR.DISPONIBLE
  },
  {
    id: 4,
    nombre: "Laura Daniela Torres",
    telefono: "315 222 3344",
    vehiculo: "Moto",
    capacidad: 3,
    estado: ESTADOS_REPARTIDOR.INACTIVO
  },
  {
    id: 5,
    nombre: "Juan Sebastián Rojas",
    telefono: "316 111 2233",
    vehiculo: "Van",
    capacidad: 6,
    estado: ESTADOS_REPARTIDOR.OCUPADO
  }
];

// Datos simulados de pedidos
let pedidos = [
  {
    id: 1,
    codigo: "PED-001",
    cliente: "Laura Gomez",
    origen: "Bodega Norte",
    destino: "Calle 80 # 45-20",
    descripcion: "Entrega de paquete mediano con documentos empresariales.",
    estado: ESTADOS_PEDIDO.EN_TRANSITO,
    prioridad: "Alta",
    repartidorId: 1,
    fechaCreacion: "2026-05-10 08:00",
    historial: [
      {
        evento: "Pedido creado",
        descripcion: "El pedido fue registrado en el sistema.",
        fecha: "2026-05-10 08:00"
      },
      {
        evento: "Pedido asignado",
        descripcion: "El pedido fue asignado al repartidor Carlos Ramírez.",
        fecha: "2026-05-10 08:25"
      },
      {
        evento: "Pedido en tránsito",
        descripcion: "El repartidor inicio la ruta hacia el destino.",
        fecha: "2026-05-10 09:05"
      }
    ]
  },
  {
    id: 2,
    codigo: "PED-002",
    cliente: "Santiago Pérez",
    origen: "Centro de Distribucion Principal",
    destino: "Carrera 15 # 93-40",
    descripcion: "Pedido de productos electronicos pequeños.",
    estado: ESTADOS_PEDIDO.PENDIENTE,
    prioridad: "Media",
    repartidorId: null,
    fechaCreacion: "2026-05-10 09:15",
    historial: [
      {
        evento: "Pedido creado",
        descripcion: "El pedido fue registrado y está pendiente de asignacion.",
        fecha: "2026-05-10 09:15"
      }
    ]
  },
  {
    id: 3,
    codigo: "PED-003",
    cliente: "Camila Rodríguez",
    origen: "Bodega Sur",
    destino: "Avenida Boyacá # 26-10",
    descripcion: "Entrega de mercado y productos de consumo.",
    estado: ESTADOS_PEDIDO.ASIGNADO,
    prioridad: "Alta",
    repartidorId: 5,
    fechaCreacion: "2026-05-10 10:00",
    historial: [
      {
        evento: "Pedido creado",
        descripcion: "El pedido fue registrado en el sistema.",
        fecha: "2026-05-10 10:00"
      },
      {
        evento: "Pedido asignado",
        descripcion: "El pedido fue asignado al repartidor Juan Sebastián Rojas.",
        fecha: "2026-05-10 10:20"
      }
    ]
  },
  {
    id: 4,
    codigo: "PED-004",
    cliente: "Daniel Martínez",
    origen: "Bodega Norte",
    destino: "Calle 127 # 18-25",
    descripcion: "Entrega programada de paquete pequeño.",
    estado: ESTADOS_PEDIDO.ENTREGADO,
    prioridad: "Baja",
    repartidorId: 1,
    fechaCreacion: "2026-05-09 14:30",
    historial: [
      {
        evento: "Pedido creado",
        descripcion: "El pedido fue registrado en el sistema.",
        fecha: "2026-05-09 14:30"
      },
      {
        evento: "Pedido asignado",
        descripcion: "El pedido fue asignado al repartidor Carlos Ramírez.",
        fecha: "2026-05-09 14:45"
      },
      {
        evento: "Pedido en tránsito",
        descripcion: "El repartidor inicio la ruta de entrega.",
        fecha: "2026-05-09 15:10"
      },
      {
        evento: "Pedido entregado",
        descripcion: "El pedido fue entregado correctamente al cliente.",
        fecha: "2026-05-09 16:05"
      }
    ]
  },
  {
    id: 5,
    codigo: "PED-005",
    cliente: "Valentina Herrera",
    origen: "Sucursal Chapinero",
    destino: "Transversal 60 # 104-15",
    descripcion: "Entrega de paquete frágil.",
    estado: ESTADOS_PEDIDO.CANCELADO,
    prioridad: "Media",
    repartidorId: null,
    fechaCreacion: "2026-05-09 11:00",
    historial: [
      {
        evento: "Pedido creado",
        descripcion: "El pedido fue registrado en el sistema.",
        fecha: "2026-05-09 11:00"
      },
      {
        evento: "Pedido cancelado",
        descripcion: "El cliente solicito la cancelacion del pedido.",
        fecha: "2026-05-09 11:25"
      }
    ]
  }
];

/**
 * Busca un repartidor por ID.
 * @param {number|null} id - Identificador del repartidor.
 * @returns {object|null}
 */
function obtenerRepartidorPorId(id) {
  if (!id) return null;
  return repartidores.find((repartidor) => repartidor.id === id) || null;
}

/**
 * Busca un pedido por codigo.
 * @param {string} codigo - Codigo del pedido.
 * @returns {object|null}
 */
function obtenerPedidoPorCodigo(codigo) {
  return (
    pedidos.find(
      (pedido) => pedido.codigo.toLowerCase() === codigo.trim().toLowerCase()
    ) || null
  );
}

/**
 * Genera el proximo ID para un pedido nuevo.
 * @returns {number}
 */
function generarNuevoPedidoId() {
  if (pedidos.length === 0) return 1;
  return Math.max(...pedidos.map((pedido) => pedido.id)) + 1;
}

/**
 * Genera fecha actual simulada en formato legible.
 * @returns {string}
 */
function obtenerFechaActualSimulada() {
  const fecha = new Date();

  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");

  return `${anio}-${mes}-${dia} ${horas}:${minutos}`;
}