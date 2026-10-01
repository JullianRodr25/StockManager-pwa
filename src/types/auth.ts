// Deben mantenerse sincronizados manualmente con los DTOs de
// StockManager.Application/DTOs/AuthDtos.cs en el backend.

export interface AuthRequest {
  identificador: string; // NumeroIdentificacion o Email
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface RegistrarClienteRequest {
  numeroIdentificacion: string;
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  direccion: string;
}

export interface RegistrarResponse {
  id: string;
  message: string;
}

export interface ClienteAutenticado {
  id: string;
  numeroIdentificacion: string;
  nombre: string;
  rol?: string; // Solo presente para usuarios de tipo Empleado
}

export interface SolicitarRecuperacionRequest {
  email: string;
}

export interface RestablecerContrasenaRequest {
  token: string;
  nuevaPassword: string;
}

export interface MensajeResponse {
  message: string;
}
