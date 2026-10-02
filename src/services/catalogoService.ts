import { apiRequest } from './api';
import type { CatalogoPaginado, CategoriaCatalogo } from '../types/catalogo';

export async function obtenerCatalogo(
  pagina: number,
  tamanoPagina: number,
  token: string | null,
  categoriaId?: number
): Promise<CatalogoPaginado> {
  const params = new URLSearchParams({
    pagina: String(pagina),
    tamanoPagina: String(tamanoPagina),
  });
  if (categoriaId !== undefined) {
    params.set('categoriaId', String(categoriaId));
  }
  return apiRequest<CatalogoPaginado>(`/api/catalogo?${params.toString()}`, { token });
}

export async function obtenerCategoriasCatalogo(token: string | null): Promise<CategoriaCatalogo[]> {
  return apiRequest<CategoriaCatalogo[]>('/api/catalogo/categorias', { token });
}
