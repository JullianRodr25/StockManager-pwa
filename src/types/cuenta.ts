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
}

export interface CambiarPasswordPropioRequest {
  passwordActual: string;
  passwordNueva: string;
}
