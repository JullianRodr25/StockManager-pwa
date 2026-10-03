import { apiRequest } from './api';
import type { MensajeResponse } from '../types/auth';
import type { ActualizarClienteRequest, CambiarPasswordPropioRequest, ClienteResponse } from '../types/cuenta';

// Autoservicio del cliente autenticado (MiCuentaController en el backend): el cliente nunca
// se pasa como parámetro, siempre sale del token.
export async function obtenerMiCuenta(token: string | null): Promise<ClienteResponse> {
  return apiRequest<ClienteResponse>('/api/mi-cuenta', { token });
}

export async function actualizarMiCuenta(
  request: ActualizarClienteRequest,
  token: string | null
): Promise<ClienteResponse> {
  return apiRequest<ClienteResponse>('/api/mi-cuenta', { method: 'PUT', body: request, token });
}

export async function cambiarPasswordPropio(
  request: CambiarPasswordPropioRequest,
  token: string | null
): Promise<MensajeResponse> {
  return apiRequest<MensajeResponse>('/api/mi-cuenta/cambiar-password', { method: 'POST', body: request, token });
}

// Foto de perfil (api/mi-cuenta/foto). Depende de que el backend tenga configurado Azure Blob
// Storage — ver MiCuentaController en el backend.
export async function subirFotoPerfil(archivo: File, token: string | null): Promise<ClienteResponse> {
  const formData = new FormData();
  formData.append('archivo', archivo);
  return apiRequest<ClienteResponse>('/api/mi-cuenta/foto', { method: 'POST', body: formData, token });
}

export async function eliminarFotoPerfil(token: string | null): Promise<ClienteResponse> {
  return apiRequest<ClienteResponse>('/api/mi-cuenta/foto', { method: 'DELETE', token });
}
