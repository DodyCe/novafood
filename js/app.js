// app.js - COORDINA: el jefe que conecta todo (punto 28: "¿qué archivo coordina? Este").
// No calcula ni dibuja: importa datos, reglas, carrito, facturas, menú, CRUD e interfaz,
// y escucha eventos del DOM. Flujo: Datos -> reglas -> carrito -> factura -> interfaz -> aplicación.

import { productos } from "./productos.js";
import {
  calcularSubtotal,
  calcularDescuento,
  calcularTotal,
  buscarPorNombre,
  filtrarPorCategoria,
  ordenarPorPrecioAsc,
  contarStockBajo,
  generarNumeroPedido,
  obtenerFechaHora,
} from "./utilidades.js";
import {
  carrito,
  agregarAlCarrito,
  cambiarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
  guardarPedido,
  cargarPedido,
  cargarStock,
  descontarStock,
  restablecerStock,
} from "./carrito.js";
import { generarFactura, guardarFactura, obtenerHistorial, limpiarHistorial, ventasAcumuladas, numPedidos } from "./facturas.js";
import { crearMenuOverlay } from "./menu.js";
import { initCrud, crearProducto, actualizarProducto, eliminarProducto, toggleVisible, listarProductos } from "./crudProductos.js";
import { renderCatalogo, renderCarrito, renderDashboard, renderHistorial, renderGestor, mostrarMensaje } from "./ui.js";

// --- INIT: productos guardados (CRUD) -> stock -> pedido (pruebas 9 y 10) ---
initCrud(); // aplica productosNovaFood (nuevos, visibles, fotos) ANTES de dibujar
cargarStock(); // aplica stockNovaFood sobre productos
cargarPedido();
document.getElementById("numeroPedido").textContent = generarNumeroPedido();
document.getElementById("fechaPedido").textContent = obtenerFechaHora();
refrescar();

// UTILIDAD: redibuja catálogo (solo visibles + filtros) + carrito + dashboard ACUMULADO.
function refrescar() {
  // Actividad 4: búsqueda + categoría actúan JUNTAS, solo sobre visibles
  const texto = document.getElementById("busqueda").value;
  const cat = document.getElementById("filtroCategoria").value;
  const orden = document.getElementById("ordenPrecio").value;

  let lista = productos.filter((p) => p.visible); // CRUD: ocultos no salen en el menú principal
  lista = buscarPorNombre(lista, texto); // 1. filtra por nombre
  lista = filtrarPorCategoria(lista, cat); // 2. sobre ese resultado filtra por categoría
  if (orden === "asc") lista = ordenarPorPrecioAsc(lista); // reto: ordenar

  renderCatalogo(lista);
  renderCarrito(carrito);
  renderDashboard(
    productos.filter((p) => p.visible).length, // productos visibles en catálogo
    ventasAcumuladas(), // punto 6: suma de facturas, no del carrito actual
    numPedidos(), // punto 6: cantidad de facturas
    contarStockBajo(productos)
  );
}

// --- MENÚ HAMBURGUESA arriba a la izquierda (puntos 2 y 4) ---
// Equivalente vanilla a <HamburgerMenuOverlay> con gradient + blur + callbacks.
// Iconos Lucide (SVG inline) — equivalentes a lucide-react: Home, Search, Package, Receipt, User, Settings

const SVG = {
  Home: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  Search: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  Package: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4l-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  Receipt: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>`,
  User: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  Settings: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
};

const abrirModal = (id) => {
  const el = document.getElementById(id);
  const modal = bootstrap.Modal.getOrCreateInstance(el);
  if (id === "modalHistorial") renderHistorial(obtenerHistorial());
  if (id === "modalGestor") {
    renderGestor(listarProductos());
    resetFormProducto();
  }
  modal.show();
};

crearMenuOverlay({
  items: [
    { label: "Inicio",               icon: SVG.Home,     onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { label: "Buscar",               icon: SVG.Search,   onClick: () => document.getElementById("busqueda").focus() },
    { label: "Gestor de productos",  icon: SVG.Package,  onClick: () => abrirModal("modalGestor") },
    { label: "Historial de facturas",icon: SVG.Receipt,  onClick: () => abrirModal("modalHistorial") },
    { label: "Perfil",               icon: SVG.User,     onClick: () => mostrarMensaje("Perfil: vista demostrativa (solo visual).", "exito") },
    { label: "Ajustes",              icon: SVG.Settings, onClick: () => mostrarMensaje("Ajustes: vista demostrativa (solo visual).", "exito") },
  ],
  overlayBackground: "linear-gradient(135deg, #D62828 0%, #F77F00 100%)",
  enableBlur: true,
  menuAlignment: "left",
  animationDuration: 1.5,
  buttonTop: "40px",
  buttonLeft: "40px",
  buttonColor: "#D62828",
  onOpen: () => console.log("Menu opened"),
  onClose: () => console.log("Menu closed"),
});

// --- EVENTOS DE FILTROS ---
document.getElementById("busqueda").addEventListener("input", refrescar);
document.getElementById("filtroCategoria").addEventListener("change", refrescar);
document.getElementById("ordenPrecio").addEventListener("change", refrescar);

// Reto básico: botón limpiar búsqueda
document.getElementById("btnLimpiar").addEventListener("click", () => {
  document.getElementById("busqueda").value = "";
  document.getElementById("filtroCategoria").value = "Todas";
  document.getElementById("ordenPrecio").value = "ninguno";
  refrescar();
});

// --- EVENTO: agregar con botón + (delegación) ---
document.getElementById("catalogo").addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-add");
  if (btn && !btn.disabled) {
    const r = agregarAlCarrito(Number(btn.dataset.id)); // valida stock actual dentro
    if (!r.ok) mostrarMensaje(r.msg); // avisa si supera inventario o agotado
    else guardarPedido(); // guarda cada cambio en LocalStorage
    refrescar();
  }
});

// --- EVENTOS DEL CARRITO: cambiar cantidad y eliminar (delegación) ---
document.getElementById("carrito").addEventListener("change", (e) => {
  if (e.target.classList.contains("cant")) {
    const r = cambiarCantidad(Number(e.target.dataset.id), e.target.value);
    if (!r.ok) mostrarMensaje(r.msg);
    guardarPedido();
    refrescar();
  }
});
document.getElementById("carrito").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-del]");
  if (btn) {
    eliminarDelCarrito(Number(btn.dataset.del));
    guardarPedido();
    refrescar();
  }
});

// --- BOTONES PEDIDO ---
document.getElementById("btnVaciar").addEventListener("click", () => {
  vaciarCarrito();
  guardarPedido();
  refrescar();
});

// Confirmar = vender: genera FACTURA (punto 5), descuenta stock, suma a ventas/pedidos (punto 6).
document.getElementById("btnConfirmar").addEventListener("click", () => {
  if (carrito.length === 0) {
    mostrarMensaje("Carrito vacío, agrega productos primero.");
    return;
  }
  const sub = calcularSubtotal(carrito);
  const desc = calcularDescuento(sub);
  const total = sub - desc;
  const factura = generarFactura(carrito, sub, desc, total); // módulo facturas.js
  guardarFactura(factura); // historialNovaFood (separado del stock)
  descontarStock(); // resta cantidades y hace guardarStock() automáticamente
  vaciarCarrito();
  guardarPedido(); // carrito vacío queda guardado
  document.getElementById("numeroPedido").textContent = generarNumeroPedido();
  document.getElementById("fechaPedido").textContent = obtenerFechaHora();
  refrescar(); // dashboard ya muestra ventas y pedidos sumados
  mostrarMensaje(`Factura #${factura.numero} generada. Total ${total.toLocaleString("es-CO")}.`, "exito");
});

// Restablecer: solo stock + carrito (historial va POR SEPARADO, no se toca).
document.getElementById("btnRestablecer").addEventListener("click", () => {
  restablecerStock();
  location.reload(); // recarga con valores originales de productos.js
});

// --- HISTORIAL: borrar por separado ---
document.getElementById("btnLimpiarHistorial").addEventListener("click", () => {
  limpiarHistorial();
  renderHistorial(obtenerHistorial());
  refrescar(); // ventas y pedidos vuelven a 0
  mostrarMensaje("Historial de facturas borrado.", "exito");
});

// --- GESTOR CRUD: formulario crear/editar con foto ---
const resetFormProducto = () => {
  document.getElementById("formProducto").reset();
  document.getElementById("prodId").value = "";
  document.getElementById("btnGuardarProd").textContent = "Guardar producto";
  document.getElementById("btnCancelarEdicion").classList.add("d-none");
};

document.getElementById("btnCancelarEdicion").addEventListener("click", resetFormProducto);

document.getElementById("formProducto").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("prodId").value;
  const datos = {
    nombre: document.getElementById("prodNombre").value,
    categoria: document.getElementById("prodCategoria").value,
    precio: document.getElementById("prodPrecio").value,
    stock: document.getElementById("prodStock").value,
    emoji: document.getElementById("prodEmoji").value,
    imagenFile: document.getElementById("prodFoto").files[0] || null, // foto opcional
  };
  const r = id ? await actualizarProducto(Number(id), datos) : await crearProducto(datos);
  if (!r.ok) {
    mostrarMensaje("Revisa el formulario: " + r.errores.join(", "));
    return;
  }
  resetFormProducto();
  renderGestor(listarProductos());
  refrescar(); // el catálogo muestra/oculta según visible
  mostrarMensaje(id ? "Producto actualizado." : "Producto creado y visible en el menú.", "exito");
});

// --- GESTOR CRUD: botones mostrar/ocultar, editar, borrar (delegación) ---
document.getElementById("tablaGestor").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-gestor]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const acc = btn.dataset.gestor;
  if (acc === "toggle") {
    toggleVisible(id); // habilita/deshabilita vista en el menú principal
    renderGestor(listarProductos());
    refrescar();
  } else if (acc === "eliminar") {
    if (!confirm("¿Borrar este producto del catálogo?")) return;
    eliminarProducto(id);
    renderGestor(listarProductos());
    refrescar();
  } else if (acc === "editar") {
    const p = productos.find((x) => x.id === id);
    if (!p) return;
    document.getElementById("prodId").value = p.id;
    document.getElementById("prodNombre").value = p.nombre;
    document.getElementById("prodCategoria").value = p.categoria;
    document.getElementById("prodPrecio").value = p.precio;
    document.getElementById("prodStock").value = p.stock;
    document.getElementById("prodEmoji").value = p.emoji || "🍴";
    document.getElementById("btnGuardarProd").textContent = "Actualizar producto";
    document.getElementById("btnCancelarEdicion").classList.remove("d-none");
    document.getElementById("prodNombre").focus();
  }
});
