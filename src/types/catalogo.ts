// Estos tipos deben mantenerse sincronizados manualmente con los DTOs
// del backend para el endpoint de catálogo.

export interface ProductoFotoCatalogo {
  id: number;
  url: string;
  orden: number;
}

export interface ProductoCatalogo {
  id: number;
  nombre: string;
  categoriaNombre: string;
  precio: number;
  disponible: boolean;
  // Galería de fotos del producto (carrusel estilo Homecenter), ya ordenadas. Vacía si el
  // producto todavía no tiene fotos.
  fotos: ProductoFotoCatalogo[];
}

export interface CategoriaCatalogo {
  id: number;
  nombre: string;
}

export interface CatalogoPaginado {
  data: ProductoCatalogo[];
  pagina: number;
  tamanoPagina: number;
  total: number;
  totalPaginas: number;
}
