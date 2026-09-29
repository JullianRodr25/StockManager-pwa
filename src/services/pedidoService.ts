import { apiRequest } from './api';
import type { CrearPedidoRequest, PedidoResponse, PedidosPaginadosResponse } from '../types/pedidos';

// Crea un pedido a domicilio a partir del carrito. El cliente sale del
// token en el backend (PedidosController), no se envía en el body.
export async function crearPedido(request: CrearPedidoRequest, token: string | null): Promise<PedidoResponse> {
  return apiRequest<PedidoResponse>('/api/pedidos', { method: 'POST', body: request, token });
}

export async function obtenerMisPedidos(
  pagina: number,
  tamanoPagina: number,
  token: string | null,
  estado?: string
): Promise<PedidosPaginadosResponse> {
  const params = new URLSearchParams({
    pagina: String(pagina),
    tamanoPagina: String(tamanoPagina),
  });
  if (estado) {
    params.set('estado', estado);
  }
  return apiRequest<PedidosPaginadosResponse>(`/api/pedidos/mios?${params.toString()}`, { token });
}

export async function obtenerPedidoPorId(id: number, token: string | null): Promise<PedidoResponse> {
  return apiRequest<PedidoResponse>(`/api/pedidos/${id}`, { token });
}
