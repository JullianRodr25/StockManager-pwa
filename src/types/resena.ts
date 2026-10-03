// Deben mantenerse sincronizados manualmente con los DTOs del backend (ResenaDtos.cs),
// consumidos acá vía ResenasController (api/catalogo/{productoId}/resenas).

export interface Resena {
  id: number;
  clienteId: number;
  clienteNombre: string;
  calificacion: number;
  comentario: string | null;
  fechaCreacion: string;
  fechaEdicion: string | null;
  // True si esta reseña es del cliente autenticado — controla si se muestran los botones de
  // editar/eliminar sobre esa reseña en particular.
  esPropia: boolean;
}

export interface CrearResenaRequest {
  calificacion: number;
  comentario: string | null;
}

export interface EditarResenaRequest {
  calificacion: number;
  comentario: string | null;
}
