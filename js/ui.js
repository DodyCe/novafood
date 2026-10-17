// ui.js - DOM: el ÚNICO archivo que modifica la pantalla (punto 28: "¿dónde se modifica el DOM? Aquí").
// Usa forEach() para dibujar listas, template literals `` para crear HTML, y getElementById para ubicar zonas.
// Novedades: imagen cuadrada robusta (onerror por JS, sin data-URI en el HTML), stock visible,
// historial de facturas, dashboard con ventas/pedidos ACUMULADOS y lista del gestor CRUD.

import { formatoMoneda, calcularSubtotal, calcularDescuento } from "./utilidades.js";
import { placeholderImg } from "./productos.js";

// UTILIDAD interna: asigna fallback de imagen por JS (evita comillas rotas del onerror en línea).
// Si assets/img falla, pone placeholder local; si eso falla, muestra cajita con emoji.
const blindarImagenes = (contenedor) => {
  contenedor.querySelectorAll("img.prod-img").forEach((img) => {
    img.addEventListener("error", function falla() {
      img.removeEventListener("error", falla);
      try {
        img.src = placeholderImg({ nombre: img.alt || "N", emoji: img.dataset.emoji || "N" });
      } catch {
        const div = document.createElement("div");
        div.className = "prod-img prod-emoji";
        div.textContent = img.dataset.emoji || "🍴";
        img.replaceWith(div);
      }
    });
  });
};

// UTILIDAD: dibuja el catálogo. Recibe la lista ya filtrada (solo visibles) desde app.js.
export const renderCatalogo = (lista) => {
  const cont = document.getElementById("catalogo");
  if (lista.length === 0) {
    cont.innerHTML = '<p class="text-muted">No se encontraron productos.</p>';
    return;
  }
  cont.innerHTML = ""; // limpia antes de dibujar
  // forEach(): hace una tarjeta Bootstrap por cada producto
  lista.forEach((p) => {
    const agotado = p.stock <= 0;
    const esBajo = p.stock > 0 && p.stock <= 3; // regla visual stock bajo
    const badge = agotado
      ? '<span class="badge bg-danger">Agotado</span>'
      : esBajo
        ? '<span class="badge bg-naranja">Stock bajo</span>'
        : '<span class="badge bg-success">Disponible</span>';
    cont.innerHTML += `
      <div class="card card-prod shadow-sm">
        <div class="card-body d-flex align-items-center gap-2 py-2">
          <img src="${p.imagen}" alt="${p.nombre}" data-emoji="${p.emoji || "🍴"}" class="prod-img" loading="lazy" />
          <div class="flex-grow-1 min-w-0">
            <strong>${p.nombre}</strong><br />
            <small class="text-muted">${p.categoria}</small><br />
            <small class="fw-bold ${agotado ? "text-danger" : "text-rojo"}">Stock: ${p.stock}</small>
          </div>
          <div class="text-end flex-shrink-0">
            <div class="fw-bold text-rojo">${formatoMoneda(p.precio)}</div>
            <div class="my-1">${badge}</div>
            <button class="btn ${agotado ? "btn-secondary" : "btn-rojo"} btn-sm btn-add btn-nova" data-id="${p.id}" ${agotado ? "disabled" : ""}>+</button>
          </div>
        </div>
      </div>`;
  });
  blindarImagenes(cont); // activa fallback robusto
};

// UTILIDAD: dibuja el carrito + subtotal, descuento y total.
export const renderCarrito = (carrito) => {
  const cont = document.getElementById("carrito");
  if (carrito.length === 0) {
    cont.innerHTML = '<p class="text-muted">Carrito vacío. Agrega productos con +</p>';
  } else {
    // map().join(""): convierte cada item en HTML Bootstrap
    cont.innerHTML = carrito
      .map(
        (i) => `
      <div class="d-flex justify-content-between align-items-center border-bottom py-1 small gap-1">
        <span class="text-truncate">${i.nombre} x${i.cantidad}</span>
        <span class="d-flex align-items-center gap-1 flex-shrink-0">
          <span class="fw-bold">${formatoMoneda(i.precio * i.cantidad)}</span>
          <input type="number" class="form-control form-control-sm cant" data-id="${i.id}" value="${i.cantidad}" min="1" style="width:60px" />
          <button class="btn btn-outline-danger btn-sm" data-del="${i.id}">X</button>
        </span>
      </div>`
      )
      .join("");
  }
  // Actualiza resumen del pedido + anima el total si hay descuento
  const sub = calcularSubtotal(carrito);
  const desc = calcularDescuento(sub);
  document.getElementById("subtotal").textContent = formatoMoneda(sub);
  document.getElementById("descuento").textContent = "-" + formatoMoneda(desc);
  const totalEl = document.getElementById("total");
  totalEl.textContent = formatoMoneda(sub - desc);
  totalEl.classList.toggle("con-descuento", desc > 0); // pulso amarillo útil
};

// UTILIDAD: dibuja el dashboard con ACUMULADOS (Actividad 7 + punto 6).
// ventasAcumuladas = suma de facturas, numPedidos = cantidad de facturas.
export const renderDashboard = (totalProductos, ventasAcumuladas, numPedidos, stockBajo) => {
  document.getElementById("dashProductos").textContent = totalProductos;
  document.getElementById("dashPedidos").textContent = numPedidos;
  document.getElementById("dashVentas").textContent = formatoMoneda(ventasAcumuladas);
  document.getElementById("dashStockBajo").textContent = stockBajo;
};

// UTILIDAD: dibuja el historial de facturas en el modal (punto 4 y 5).
export const renderHistorial = (historial) => {
  const cont = document.getElementById("tablaHistorial");
  const totalEl = document.getElementById("totalHistorial");
  if (historial.length === 0) {
    cont.innerHTML = '<p class="text-muted">Aún no hay facturas. Confirma un pedido para generar la primera.</p>';
    totalEl.textContent = formatoMoneda(0);
    return;
  }
  // Más recientes primero
  const filas = [...historial].reverse().map((f) => `
    <div class="border rounded p-2 mb-2 small">
      <div class="d-flex justify-content-between fw-bold">
        <span>Factura #${f.numero}</span><span>${f.fecha}</span>
      </div>
      <div class="text-muted">${f.items.map((i) => `${i.nombre} x${i.cantidad}`).join(" · ")}</div>
      <div class="d-flex justify-content-between mt-1">
        <span>Subtotal ${formatoMoneda(f.subtotal)} · Desc. -${formatoMoneda(f.descuento)}</span>
        <strong class="text-rojo">Total ${formatoMoneda(f.total)}</strong>
      </div>
    </div>`).join("");
  cont.innerHTML = filas;
  const granTotal = historial.reduce((a, f) => a + (f.total || 0), 0);
  totalEl.textContent = formatoMoneda(granTotal);
};

// UTILIDAD: dibuja la tabla del gestor de productos/CRUD (punto 3 del usuario).
export const renderGestor = (lista) => {
  const cont = document.getElementById("tablaGestor");
  if (lista.length === 0) {
    cont.innerHTML = '<p class="text-muted">No hay productos. Crea el primero con el formulario.</p>';
    return;
  }
  cont.innerHTML = lista.map((p) => `
    <div class="d-flex align-items-center gap-2 border rounded p-2 mb-2 small ${p.visible ? "" : "opacity-50"}">
      <img src="${p.imagen}" alt="${p.nombre}" data-emoji="${p.emoji || "🍴"}" class="prod-img prod-img-sm" loading="lazy" />
      <div class="flex-grow-1 min-w-0">
        <strong>${p.nombre}</strong> <span class="badge ${p.visible ? "bg-success" : "bg-secondary"}">${p.visible ? "Visible" : "Oculto"}</span><br />
        <span class="text-muted">${p.categoria} · ${formatoMoneda(p.precio)} · Stock ${p.stock}</span>
      </div>
      <div class="d-flex flex-column gap-1 flex-shrink-0">
        <button class="btn btn-sm btn-outline-nova btn-nova" data-gestor="toggle" data-id="${p.id}">${p.visible ? "Ocultar" : "Mostrar"}</button>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-primary" data-gestor="editar" data-id="${p.id}">Editar</button>
          <button class="btn btn-sm btn-outline-danger" data-gestor="eliminar" data-id="${p.id}">Borrar</button>
        </div>
      </div>
    </div>`).join("");
  blindarImagenes(cont);
};

// UTILIDAD: muestra mensajes Bootstrap (ej: stock superado). Se oculta solo a los 3s.
export const mostrarMensaje = (texto, tipo = "error") => {
  const div = document.getElementById("mensaje");
  div.textContent = texto;
  // error -> rojo, exito -> verde (clases Bootstrap alert)
  div.className = tipo === "exito" ? "alert alert-success" : "alert alert-danger";
  clearTimeout(div._t);
  div._t = setTimeout(() => div.classList.add("d-none"), 3000);
};
