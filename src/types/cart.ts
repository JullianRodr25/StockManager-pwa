// Línea del carrito local (client-side). No existe un concepto de
// "carrito" en el backend: al confirmar el pedido, estas líneas se
// traducen a LineaPedidoRequest[] (types/pedidos.ts) en un solo POST
// a /api/pedidos. Guardamos aquí nombre/precio además del id para
// poder mostrar el carrito sin volver a llamar al catálogo.
export interface CartItem {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
}
