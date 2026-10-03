// Deben mantenerse sincronizados manualmente con los DTOs de
// StockManager.Application/DTOs/ClienteDtos.cs en el backend (ClienteResponse,
// ActualizarClienteRequest, CambiarPasswordPropioRequest), consumidos acá vía
// MiCuentaController (api/mi-cuenta).

export interface ClienteResponse {
  id: number;
  numeroIdentificacion: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  activo: boolean;
  origenRegistro: string;
  tipoDocumentoFiscal: string | null;
  numeroDocumentoFiscal: string | null;
  razonSocialFiscal: string | null;
  direccionFiscal: string | null;
  emailFacturacion: string | null;
  tieneDatosFacturacionElectronicaCompletos: boolean;
  fotoUrl: string | null;
}

export interface ActualizarClienteRequest {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  // Opcionales: si se omiten, el backend conserva las coordenadas que el cliente ya tuviera
  // guardadas (ver ActualizarClienteRequest en el backend). Perfil.tsx siempre las envía.
  latitud?: number | null;
  longitud?: number | null;
}

export interface CambiarPasswordPropioRequest {
  passwordActual: string;
  passwordNueva: string;
}
