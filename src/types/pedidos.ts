// Estos tipos deben mantenerse sincronizados manualmente con
// StockManager.Application/DTOs/PedidoDtos.cs en el backend.

export type EstadoPedido =
  | 'Pendiente'
  | 'Confirmado'
  | 'EnPreparacion'
  | 'EnCamino'
  | 'Entregado'
  | 'Cancelado';

export type EstadoLineaPedido = 'Disponible' | 'PorEncargo';

export interface LineaPedidoRequest {
  productoId: number;
  cantidad: number;
}

export interface CrearPedidoRequest {
  direccion: string;
  lineas: LineaPedidoRequest[];
  /** Coordenadas del pin confirmado en el selector de mapa (MapaDireccion). Opcionales. */
  latitud?: number;
  longitud?: number;
}

export interface DetallePedidoResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  estadoLinea: EstadoLineaPedido;
}

export interface PedidoResponse {
  id: number;
  clienteId: number;
  clienteNombre: string;
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  fecha: string;
  estado: EstadoPedido;
  total: number;
  ventaId: number | null;
  detalles: DetallePedidoResponse[];
}

export interface PedidoResumenResponse {
  id: number;
  clienteNombre: string;
  fecha: string;
  estado: EstadoPedido;
  total: number;
  tieneLineasPorEncargo: boolean;
}

export interface PedidosPaginadosResponse {
  data: PedidoResumenResponse[];
  pagina: number;
  tamanoPagina: number;
  total: number;
  totalPaginas: number;
}
