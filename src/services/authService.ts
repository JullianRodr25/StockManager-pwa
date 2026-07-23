import { apiRequest } from './api';
import type {
  AuthRequest,
  AuthResponse,
  RegistrarClienteRequest,
  RegistrarResponse,
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
