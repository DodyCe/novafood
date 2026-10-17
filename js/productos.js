// productos.js - DATOS: aquí viven los datos (punto 28: "¿dónde están los datos? Aquí").
// Cada producto es un objeto con id, nombre, categoria, precio, stock, imagen, emoji, visible.
// - id: identificador único, sirve para buscar con find().
// - nombre/categoria: sirven para búsqueda y filtro con filter().
// - precio/stock: sirven para cálculos (reduce) y validación de inventario.
// - imagen: ruta local en assets/img/*.svg (existen archivos reales de 60x60).
// - emoji: fallback visual si falla la imagen.
// - visible: true/false para mostrar/ocultar en catálogo (CRUD).
// Esta info pertenece al producto porque sin ella no se puede vender ni controlar inventario.

export const productos = [
  { id: 1, nombre: "Hamburguesa clásica", categoria: "Comida", precio: 22000, stock: 10, imagen: "assets/img/1-hamburguesa.svg", emoji: "🍔", visible: true },
  { id: 2, nombre: "Pizza personal", categoria: "Comida", precio: 18000, stock: 8, imagen: "assets/img/2-pizza.svg", emoji: "🍕", visible: true },
  { id: 3, nombre: "Combo ejecutivo", categoria: "Combos", precio: 29000, stock: 3, imagen: "assets/img/3-combo-ejecutivo.svg", emoji: "🍱", visible: true },
  { id: 4, nombre: "Café latte", categoria: "Bebidas", precio: 8000, stock: 15, imagen: "assets/img/4-cafe.svg", emoji: "☕", visible: true },
  { id: 5, nombre: "Tacos mexicanos", categoria: "Comida", precio: 16000, stock: 12, imagen: "assets/img/5-tacos.svg", emoji: "🌮", visible: true },
  { id: 6, nombre: "Limonada natural", categoria: "Bebidas", precio: 6000, stock: 20, imagen: "assets/img/6-limonada.svg", emoji: "🍋", visible: true },
  { id: 7, nombre: "Torta de chocolate", categoria: "Postres", precio: 12000, stock: 5, imagen: "assets/img/7-torta.svg", emoji: "🍰", visible: true },
  { id: 8, nombre: "Combo familiar", categoria: "Combos", precio: 55000, stock: 4, imagen: "assets/img/8-combo-familiar.svg", emoji: "🍟", visible: true },
  { id: 9, nombre: "Ensalada César", categoria: "Comida", precio: 14000, stock: 7, imagen: "assets/img/9-ensalada.svg", emoji: "🥗", visible: true },
  { id: 10, nombre: "Brownie con helado", categoria: "Postres", precio: 10000, stock: 6, imagen: "assets/img/10-brownie.svg", emoji: "🍨", visible: true },
];

// UTILIDAD: genera placeholder SVG LOCAL (data URI) - funciona 100% offline, sin emojis rotos.
// Usa iniciales del nombre + fondo amarillo comida + texto rojo.
// toB64() es unicode-safe: btoa() solo falla con tildes/emojis, así nunca rompe.
export const toB64 = (str) => btoa(unescape(encodeURIComponent(str)));

export const placeholderImg = (p) => {
  const iniciales = p.nombre.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'>`
    + `<rect width='60' height='60' fill='#FCBF49' rx='10'/>`
    + `<text x='30' y='39' font-family='Arial,Helvetica,sans-serif' font-size='20' font-weight='bold' fill='#7a2e0e' text-anchor='middle'>${iniciales}</text></svg>`;
  return "data:image/svg+xml;base64," + toB64(svg);
};

// UTILIDAD: próximo ID disponible para CRUD.
export const nextId = () => Math.max(...productos.map((p) => p.id), 0) + 1;

// UTILIDAD: guarda array completo en LocalStorage (persistencia CRUD).
const KEY_PRODUCTOS = "productosNovaFood";
export const guardarProductos = () => localStorage.setItem(KEY_PRODUCTOS, JSON.stringify(productos));
export const cargarProductosGuardados = () => {
  const d = localStorage.getItem(KEY_PRODUCTOS);
  if (!d) return;
  try {
    const arr = JSON.parse(d);
    if (Array.isArray(arr)) {
      // merge: preserva stock actual de memoria, actualiza resto
      arr.forEach((guardado) => {
        const idx = productos.findIndex((p) => p.id === guardado.id);
        if (idx >= 0) {
          const stockActual = productos[idx].stock;
          productos[idx] = { ...guardado, stock: stockActual };
        } else {
          productos.push(guardado);
        }
      });
    }
  } catch {}
};