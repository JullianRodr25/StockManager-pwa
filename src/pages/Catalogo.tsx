import { useCallback, useEffect, useState } from 'react';
import { Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ApiError } from '@/services/api';
import { obtenerCatalogo } from '@/services/catalogoService';
import { useSincronizacionCatalogo } from '@/hooks/useSincronizacionCatalogo';
import type { ProductoCatalogo } from '@/types/catalogo';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatoMoneda } from '@/lib/formato';

const TAMANO_PAGINA = 20;

export function Catalogo() {
  const { usuario, token } = useAuth();
  const { agregarProducto } = useCart();

  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarCatalogo = useCallback(
    async (paginaSolicitada: number) => {
      setCargando(true);
      setError(null);
      try {
        const respuesta = await obtenerCatalogo(paginaSolicitada, TAMANO_PAGINA, token);
        setProductos(respuesta.data);
        setPagina(respuesta.pagina);
        setTotalPaginas(respuesta.totalPaginas);
        setTotal(respuesta.total);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'No se pudo cargar el catálogo.');
      } finally {
        setCargando(false);
      }
    },
    [token]
  );

  // Cuando el stock de un producto cambia (venta de mostrador, cuenta fiada, otro pedido de
  // la PWA, etc.), esto actualiza en vivo el badge "Disponible"/"Agotado" sin recargar nada.
  useSincronizacionCatalogo(setProductos);

  useEffect(() => {
    cargarCatalogo(1);
    // Solo debe recargar cuando cambia el token; cargarCatalogo ya lo tiene como dependencia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function irAPagina(nuevaPagina: number) {
    cargarCatalogo(nuevaPagina);
  }

  function pedir(producto: ProductoCatalogo) {
    agregarProducto(producto);
    toast.success(`${producto.nombre} agregado al carrito`);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-navy">Hola, {usuario?.nombre}</h1>

      {error && (
        <div className="rounded-md border border-red-200 bg-error-bg px-3 py-2 text-sm text-error-text" role="alert">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gold motion-reduce:animate-none" />
        </div>
      ) : productos.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">No se encontraron productos.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map((producto) => (
            <Card key={producto.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <Package className="h-6 w-6" />
                </div>
                <Badge
                  variant={producto.disponible ? 'default' : 'destructive'}
                  className={producto.disponible ? 'border-transparent bg-green text-white' : undefined}
                >
                  {producto.disponible ? 'Disponible' : 'Agotado'}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-navy">{producto.nombre}</p>
                <p className="text-xs text-text-muted">{producto.categoriaNombre}</p>
              </div>
              <div className="mt-auto flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gold">{formatoMoneda.format(producto.precio)}</p>
                <Button variant="gold" size="sm" disabled={!producto.disponible} onClick={() => pedir(producto)}>
                  Pedir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!cargando && productos.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-text-muted">
            Página {pagina} de {totalPaginas} · {total} productos en total
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={pagina <= 1 || cargando} onClick={() => irAPagina(pagina - 1)}>
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagina >= totalPaginas || cargando}
              onClick={() => irAPagina(pagina + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
