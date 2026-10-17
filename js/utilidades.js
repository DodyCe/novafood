// utilidades.js - REGLAS: aquí están las reglas del negocio (punto 28: "¿dónde están las reglas? Aquí").
// Son funciones puras: reciben datos y devuelven un resultado, NO tocan el DOM.
// Si eliminamos este archivo, nada calcula: ni subtotal, ni descuento, ni filtros.

// UTILIDAD 1: sumar todo el pedido. Usa reduce() porque convierte un arreglo en un solo número.
export const calcularSubtotal = (carrito) =>
  carrito.reduce((acumulado, item) => acumulado + item.precio * item.cantidad, 0);

// UTILIDAD 2: regla de descuento.
// - 10% si subtotal >= $50.000 (Actividad 3 obligatoria)
// - 15% si subtotal > $100.000 (reto intermedio)
export const calcularDescuento = (subtotal) => {
  if (subtotal > 100000) return subtotal * 0.15;
  if (subtotal >= 50000) return subtotal * 0.10;
  return 0;
};

// UTILIDAD 3: total = subtotal - descuento.
export const calcularTotal = (carrito) => {
  const sub = calcularSubtotal(carrito);
  return sub - calcularDescuento(sub);
};

// UTILIDAD 4: dar formato $ 22.000 para mostrar en pantalla.
export const formatoMoneda = (n) => "$ " + Number(n).toLocaleString("es-CO");

// UTILIDAD 5: buscar por nombre. Usa filter() porque devuelve VARIOS coincidencias.
export const buscarPorNombre = (lista, texto) => {
  if (!texto) return lista;
  return lista.filter((p) => p.nombre.toLowerCase().includes(texto.toLowerCase()));
};

// UTILIDAD 6: filtrar por categoría. También filter() porque devuelve varios.
export const filtrarPorCategoria = (lista, categoria) =>
  categoria === "Todas" ? lista : lista.filter((p) => p.categoria === categoria);

// UTILIDAD 7: ordenar de menor a mayor precio (reto intermedio). Copia con [...] para no dañar original.
export const ordenarPorPrecioAsc = (lista) => [...lista].sort((a, b) => a.precio - b.precio);

// UTILIDAD 8: producto más caro (extensión dashboard). Usa reduce() para quedarnos con el mayor.
export const productoMayorPrecio = (lista) =>
  lista.reduce((mayor, p) => (p.precio > mayor.precio ? p : mayor), lista[0]);

// UTILIDAD 9: contar productos con stock bajo (<=3) para el dashboard. Usa filter().length
export const contarStockBajo = (lista) => lista.filter((p) => p.stock <= 3).length;

// UTILIDAD 10: reto avanzado, número de pedido + fecha/hora.
export const generarNumeroPedido = () => "# " + String(Math.floor(1000 + Math.random() * 9000));
export const obtenerFechaHora = () => new Date().toLocaleString("es-CO");
