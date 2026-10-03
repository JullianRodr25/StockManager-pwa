import { apiRequest } from './api';
import type { CrearResenaRequest, EditarResenaRequest, Resena } from '../types/resena';

// Reseñas de producto (api/catalogo/{productoId}/resenas) — ver ResenasController en el
// backend. Regla de negocio: el cliente solo puede tener una reseña por producto.
export async function listarResenas(productoId: number, token: string | null): Promise<Resena[]> {
  return apiRequest<Resena[]>(`/api/catalogo/${productoId}/resenas`, { token });
}

export async function crearResena(
  productoId: number,
  request: CrearResenaRequest,
  token: string | null
): Promise<Resena> {
  return apiRequest<Resena>(`/api/catalogo/${productoId}/resenas`, {
    method: 'POST',
    body: request,
    token,
  });
}

export async function editarResena(
  productoId: number,
  resenaId: number,
  request: EditarResenaRequest,
  token: string | null
): Promise<Resena> {
  return apiRequest<Resena>(`/api/catalogo/${productoId}/resenas/${resenaId}`, {
    method: 'PUT',
    body: request,
    token,
  });
}

export async function eliminarResena(
  productoId: number,
  resenaId: number,
  token: string | null
): Promise<void> {
  return apiRequest<void>(`/api/catalogo/${productoId}/resenas/${resenaId}`, {
    method: 'DELETE',
    token,
  });
}
