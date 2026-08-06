// Estos tipos deben mantenerse sincronizados manualmente con los DTOs
// del backend para el endpoint de catálogo.

export interface ProductoCatalogo {
  id: number;
  nombre: string;
  categoriaNombre: string;
  precio: number;
  disponible: boolean;
}

export interface CatalogoPaginado {
  data: ProductoCatalogo[];
  pagina: number;
  tamanoPagina: number;
  total: number;
  totalPaginas: number;
}
