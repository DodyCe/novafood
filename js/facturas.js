// facturas.js - MÓDULO FACTURAS: genera factura al confirmar, guarda historial en LocalStorage.
// Historial separado de stock (respuesta: por separado). Clave: historialNovaFood.

import { obtenerFechaHora } from "./utilidades.js";

const KEY_HISTORIAL = "historialNovaFood";

// Genera objeto factura con número correlativo.
export const generarFactura = (carrito, subtotal, descuento, total) => {
  const historial = obtenerHistorial();
  const numero = historial.length + 1;
  return {
    numero: String(numero).padStart(5, "0"),
    fecha: obtenerFechaHora(),
    items: carrito.map((i) => ({
      id: i.id,
      nombre: i.nombre,
      precio: i.precio,
      cantidad: i.cantidad,
      subtotal: i.precio * i.cantidad,
    })),
    subtotal,
    descuento,
    total,
  };
};

// Guarda factura en historial (push).
export const guardarFactura = (factura) => {
  const historial = obtenerHistorial();
  historial.push(factura);
  localStorage.setItem(KEY_HISTORIAL, JSON.stringify(historial));
};

// Recupera array historial.
export const obtenerHistorial = () => {
  const d = localStorage.getItem(KEY_HISTORIAL);
  if (!d) return [];
  try {
    const arr = JSON.parse(d);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

// Limpia historial completo (para botón en modal historial).
export const limpiarHistorial = () => {
  localStorage.removeItem(KEY_HISTORIAL);
};

// Ventas acumuladas = suma de total de todas las facturas.
export const ventasAcumuladas = () =>
  obtenerHistorial().reduce((acc, f) => acc + (f.total || 0), 0);

// Número de pedidos = cantidad de facturas.
export const numPedidos = () => obtenerHistorial().length;