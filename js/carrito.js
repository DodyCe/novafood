// carrito.js - PEDIDO: reglas del carrito + validación de stock + LocalStorage.
// Usa find() cuando busca UN producto por id, y filter() cuando debe devolver VARIOS.
// STOCK: se descuenta SOLO al CONFIRMAR. Agregar valida pero no resta; confirmar sí resta y guarda en LocalStorage.
// VISIBLE: solo productos con visible=true pueden agregarse al carrito.

import { productos } from "./productos.js";

const KEY_PEDIDO = "pedidoNovaFood";
const KEY_STOCK = "stockNovaFood";

export let carrito = [];

// Filtra productos visibles (para catálogo y validaciones).
const productosVisibles = () => productos.filter((p) => p.visible);

// UTILIDAD: lee el stock actual de un producto visible.
export const obtenerStockActual = (id) => productosVisibles().find((p) => p.id === id)?.stock ?? 0;

// UTILIDAD: guarda el stock actual en LocalStorage.
export const guardarStock = () => {
  const mapa = {};
  productos.forEach((p) => (mapa[p.id] = p.stock));
  localStorage.setItem(KEY_STOCK, JSON.stringify(mapa));
};

// UTILIDAD: al abrir la página, aplica el stock guardado sobre el array productos.
export const cargarStock = () => {
  const datos = localStorage.getItem(KEY_STOCK);
  if (!datos) return;
  try {
    const mapa = JSON.parse(datos);
    productos.forEach((p) => {
      if (typeof mapa[p.id] === "number") p.stock = mapa[p.id];
    });
  } catch {}
};

// UTILIDAD: devuelve stock a valores iniciales (para demo en clase).
export const restablecerStock = () => {
  localStorage.removeItem(KEY_STOCK);
  localStorage.removeItem(KEY_PEDIDO);
};

// UTILIDAD: resta lo comprado del inventario. Se llama SOLO en Confirmar.
export const descontarStock = () => {
  carrito.forEach((item) => {
    const prod = productos.find((p) => p.id === item.id);
    if (prod) prod.stock = Math.max(0, prod.stock - item.cantidad);
  });
  guardarStock();
};

// UTILIDAD: agregar 1 unidad. Si ya existe, aumenta cantidad.
// Valida stock actual y que el producto sea visible.
export const agregarAlCarrito = (id) => {
  const prod = productosVisibles().find((p) => p.id === id);
  if (!prod) return { ok: false, msg: "Producto no encontrado o no visible" };
  if (prod.stock <= 0) return { ok: false, msg: `⚠️ "${prod.nombre}" está agotado` };

  const enCarrito = carrito.find((i) => i.id === id);
  const cantidadActual = enCarrito ? enCarrito.cantidad : 0;

  if (cantidadActual + 1 > prod.stock) {
    return { ok: false, msg: `⚠️ No hay más stock de "${prod.nombre}" (quedan: ${prod.stock})` };
  }

  if (enCarrito) {
    enCarrito.cantidad++;
  } else {
    carrito.push({ id: prod.id, nombre: prod.nombre, precio: prod.precio, cantidad: 1 });
  }
  return { ok: true };
};

// UTILIDAD: cambiar cantidad desde el campo numérico. También valida stock actual.
export const cambiarCantidad = (id, nuevaCantidad) => {
  const prod = productosVisibles().find((p) => p.id === id);
  nuevaCantidad = Number(nuevaCantidad);
  if (nuevaCantidad <= 0) {
    eliminarDelCarrito(id);
    return { ok: true };
  }
  if (prod && nuevaCantidad > prod.stock) {
    return { ok: false, msg: `Máximo ${prod.stock} unidades de "${prod.nombre}"` };
  }
  const item = carrito.find((i) => i.id === id);
  if (item) item.cantidad = nuevaCantidad;
  return { ok: true };
};

// UTILIDAD: eliminar un producto del carrito. filter() crea un arreglo sin ese id.
export const eliminarDelCarrito = (id) => {
  carrito = carrito.filter((i) => i.id !== id);
};

// UTILIDAD: vaciar todo (para botón Vaciar y después de Confirmar).
export const vaciarCarrito = () => {
  carrito = [];
};

// UTILIDAD: cuántas unidades hay en total (para dashboard).
export const totalUnidades = () => carrito.reduce((acc, i) => acc + i.cantidad, 0);

// UTILIDAD: guardar el pedido en LocalStorage.
export const guardarPedido = () => {
  localStorage.setItem(KEY_PEDIDO, JSON.stringify(carrito));
};

// UTILIDAD: recuperar el pedido al recargar.
export const cargarPedido = () => {
  const datos = localStorage.getItem(KEY_PEDIDO);
  if (datos) {
    try {
      const recuperado = JSON.parse(datos);
      if (Array.isArray(recuperado)) carrito = recuperado;
    } catch {
      carrito = [];
    }
  }
};