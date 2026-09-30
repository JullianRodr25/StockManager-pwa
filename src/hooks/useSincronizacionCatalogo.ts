// Suscribe la lista de productos del catálogo a los avisos de stock en vivo. El catálogo no
// muestra la cantidad exacta (solo "Disponible"/"Agotado"), así que el criterio se mantiene
// idéntico al del backend (ProductoService.ObtenerCatalogoPaginadoAsync): disponible = stock > 0.
import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useStockRealtime } from '@/context/StockRealtimeContext';
import type { ProductoCatalogo } from '@/types/catalogo';

export function useSincronizacionCatalogo(setProductos: Dispatch<SetStateAction<ProductoCatalogo[]>>) {
  const { suscribir } = useStockRealtime();

  useEffect(() => {
    return suscribir((cambios) => {
      if (cambios.length === 0) return;

      const disponiblePorId = new Map(cambios.map((cambio) => [cambio.productoId, cambio.stockActual > 0]));

      setProductos((actuales) =>
        actuales.map((producto) =>
          disponiblePorId.has(producto.id)
            ? { ...producto, disponible: disponiblePorId.get(producto.id)! }
            : producto
        )
      );
    });
  }, [suscribir, setProductos]);
}
