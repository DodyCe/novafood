// crudProductos.js - CRUD de Productos/Combos para menú hamburguesa.
// Permite: crear, editar, eliminar, habilitar/deshabilitar vista (visible), subir foto (base64/data URL).
// Usa LocalStorage key "productosNovaFood" (compartido con productos.js).

import { productos, placeholderImg, toB64, nextId, guardarProductos, cargarProductosGuardados } from "./productos.js";

const CATEGORIAS = ["Comida", "Bebidas", "Combos", "Postres"];

// Crea SVG 60x60 con emoji para previsualización/guardado.
const crearSvgConEmoji = (emoji) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'>
    <rect width='60' height='60' fill='#FCBF49' rx='10'/>
    <text x='30' y='38' font-family='Arial' font-size='28' fill='#7a2e0e' text-anchor='middle' dominant-baseline='middle'>${emoji}</text>
  </svg>`;
  return "data:image/svg+xml;base64," + toB64(svg); // unicode-safe: no falla con emojis
};

// Convierte File a data URL (base64) para guardar en LocalStorage.
const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Valida datos de formulario.
const validarProducto = (data) => {
  const errores = [];
  if (!data.nombre?.trim()) errores.push("Nombre requerido");
  if (!CATEGORIAS.includes(data.categoria)) errores.push("Categoría inválida");
  const precio = Number(data.precio);
  if (!Number.isFinite(precio) || precio < 0) errores.push("Precio inválido");
  const stock = Number(data.stock);
  if (!Number.isInteger(stock) || stock < 0) errores.push("Stock inválido (entero >=0)");
  return { ok: errores.length === 0, errores, precio, stock };
};

// Crea producto nuevo.
export const crearProducto = async ({ nombre, categoria, precio, stock, imagenFile, emoji }) => {
  const data = { nombre, categoria, precio, stock };
  const v = validarProducto(data);
  if (!v.ok) return { ok: false, errores: v.errores };
  let imagenDataUrl = placeholderImg({ nombre, emoji });
  if (imagenFile) imagenDataUrl = await fileToDataUrl(imagenFile);
  else if (emoji) imagenDataUrl = crearSvgConEmoji(emoji);
  const nuevo = {
    id: nextId(),
    nombre: nombre.trim(),
    categoria,
    precio: v.precio,
    stock: v.stock,
    imagen: imagenDataUrl,
    emoji: emoji || "🍴",
    visible: true,
  };
  productos.push(nuevo);
  guardarProductos();
  return { ok: true, producto: nuevo };
};

// Actualiza producto existente (merge).
export const actualizarProducto = async (id, { nombre, categoria, precio, stock, imagenFile, emoji, visible }) => {
  const idx = productos.findIndex((p) => p.id === id);
  if (idx === -1) return { ok: false, errores: ["Producto no encontrado"] };
  const data = { nombre, categoria, precio, stock };
  const v = validarProducto(data);
  if (!v.ok) return { ok: false, errores: v.errores };
  const actual = productos[idx];
  let imagenDataUrl = actual.imagen;
  if (imagenFile) imagenDataUrl = await fileToDataUrl(imagenFile);
  else if (emoji) imagenDataUrl = crearSvgConEmoji(emoji);
  productos[idx] = {
    ...actual,
    nombre: nombre.trim(),
    categoria,
    precio: v.precio,
    stock: v.stock,
    imagen: imagenDataUrl,
    emoji: emoji || actual.emoji,
    visible: typeof visible === "boolean" ? visible : actual.visible,
  };
  guardarProductos();
  return { ok: true, producto: productos[idx] };
};

// Elimina producto por id.
export const eliminarProducto = (id) => {
  const idx = productos.findIndex((p) => p.id === id);
  if (idx === -1) return { ok: false, errores: ["Producto no encontrado"] };
  productos.splice(idx, 1);
  guardarProductos();
  return { ok: true };
};

// Alterna visible (habilitar/deshabilitar en catálogo).
export const toggleVisible = (id) => {
  const p = productos.find((p) => p.id === id);
  if (!p) return { ok: false, errores: ["Producto no encontrado"] };
  p.visible = !p.visible;
  guardarProductos();
  return { ok: true, visible: p.visible };
};

// Obtiene lista completa (para modal CRUD).
export const listarProductos = () => [...productos].sort((a, b) => a.id - b.id);

// Inicializa: carga guardados en LocalStorage al arrancar app.
export const initCrud = () => cargarProductosGuardados();