// Formateadores compartidos por las páginas de catálogo, carrito y
// pedidos, para no repetir la misma configuración de Intl en cada una.

export const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export const formatoFecha = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'short',
  timeStyle: 'short',
});
