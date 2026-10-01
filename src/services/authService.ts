import { apiRequest } from './api';
import type {
  AuthRequest,
  AuthResponse,
  MensajeResponse,
  RegistrarClienteRequest,
  RegistrarResponse,
  RestablecerContrasenaRequest,
  SolicitarRecuperacionRequest,
} from '../types/auth';

export async function loginCliente(credenciales: AuthRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login/cliente', {
    method: 'POST',
    body: credenciales,
  });
}

export async function registrarCliente(
  datos: RegistrarClienteRequest
): Promise<RegistrarResponse> {
  return apiRequest<RegistrarResponse>('/api/auth/registrar/cliente', {
    method: 'POST',
    body: datos,
  });
}

// La respuesta es siempre el mismo mensaje genérico, exista o no el email (por diseño del
// backend, para no revelar qué correos están registrados).
export async function solicitarRecuperacion(datos: SolicitarRecuperacionRequest): Promise<MensajeResponse> {
  return apiRequest<MensajeResponse>('/api/auth/recuperar-contrasena', {
    method: 'POST',
    body: datos,
  });
}

export async function restablecerContrasena(datos: RestablecerContrasenaRequest): Promise<MensajeResponse> {
  return apiRequest<MensajeResponse>('/api/auth/restablecer-contrasena', {
    method: 'POST',
    body: datos,
  });
}
