import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ApiError } from '@/services/api';
import { obtenerCatalogo, obtenerCategoriasCatalogo } from '@/services/catalogoService';
import { useSincronizacionCatalogo } from '@/hooks/useSincronizacionCatalogo';
import type { CategoriaCatalogo, ProductoCatalogo } from '@/types/catalogo';
import { CarruselFotosProducto } from '@/components/CarruselFotosProducto';
import { DetalleProductoModal } from '@/components/DetalleProductoModal';
import { Estrellas } from '@/components/Estrellas';
import { PantallaCargaLogo } from '@/components/PantallaCargaLogo';
import { SelectorCategorias } from '@/components/SelectorCategorias';
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

  const [categorias, setCategorias] = useState<CategoriaCatalogo[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);

  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoCatalogo | null>(null);
  const [detalleAbierto, setDetalleAbierto] = useState(false);

  const cargarCatalogo = useCallback(
    async (paginaSolicitada: number, categoriaId: number | null) => {
      setCargando(true);
      setError(null);
      try {
        const respuesta = await obtenerCatalogo(paginaSolicitada, TAMANO_PAGINA, token, categoriaId ?? undefined);
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
    cargarCatalogo(1, categoriaSeleccionada);
    // Solo debe recargar cuando cambia el token o la categoría; cargarCatalogo ya tiene el
    // resto de dependencias que necesita.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, categoriaSeleccionada]);

  useEffect(() => {
    obtenerCategoriasCatalogo(token)
      .then(setCategorias)
      .catch(() => {
        // Si fallan los filtros, el catálogo sigue funcionando sin ellos — no es crítico.
      });
  }, [token]);

  function irAPagina(nuevaPagina: number) {
    cargarCatalogo(nuevaPagina, categoriaSeleccionada);
  }

  function seleccionarCategoria(categoriaId: number | null) {
    setCategoriaSeleccionada(categoriaId);
  }

  function pedir(producto: ProductoCatalogo) {
    agregarProducto(producto);
    toast.success(`${producto.nombre} agregado al carrito`);
  }

  function abrirDetalle(producto: ProductoCatalogo) {
    setProductoSeleccionado(producto);
    setDetalleAbierto(true);
  }

  // El modal de reseñas recalcula el promedio/total en el momento (crear/editar/eliminar una
  // reseña), así que la tarjeta del catálogo se actualiza sin tener que recargar la página.
  function actualizarCalificacionProducto(
    productoId: number,
    calificacionPromedio: number | null,
    totalResenas: number
  ) {
    setProductos((prev) =>
      prev.map((p) => (p.id === productoId ? { ...p, calificacionPromedio, totalResenas } : p))
    );
    setProductoSeleccionado((prev) =>
      prev && prev.id === productoId ? { ...prev, calificacionPromedio, totalResenas } : prev
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-navy">Hola, {usuario?.nombre}</h1>

      {categorias.length > 0 && (
        <SelectorCategorias
          categorias={categorias}
          seleccionada={categoriaSeleccionada}
          onSeleccionar={seleccionarCategoria}
        />
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-error-bg px-3 py-2 text-sm text-error-text" role="alert">
          {error}
        </div>
      )}

      {cargando ? (
        <PantallaCargaLogo variante="en-linea" />
      ) : productos.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">No se encontraron productos.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {productos.map((producto) => (
            <Card
              key={producto.id}
              onClick={() => abrirDetalle(producto)}
              className="flex cursor-pointer flex-col gap-3 overflow-hidden rounded-2xl p-4 transition-transform active:scale-[0.98]"
            >
              <div className="relative">
                <CarruselFotosProducto fotos={producto.fotos} nombre={producto.nombre} />
                <Badge
                  variant={producto.disponible ? 'default' : 'destructive'}
                  className={`absolute right-1.5 top-1.5 ${producto.disponible ? 'border-transparent bg-green text-white' : ''}`}
                >
                  {producto.disponible ? 'Disponible' : 'Agotado'}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium leading-snug text-navy">{producto.nombre}</p>
                <p className="text-xs text-text-muted">{producto.categoriaNombre}</p>
                {producto.totalResenas > 0 && (
                  <div className="flex items-center gap-1">
                    <Estrellas valor={producto.calificacionPromedio ?? 0} tamano="sm" />
                    <span className="text-xs text-text-muted">({producto.totalResenas})</span>
                  </div>
                )}
              </div>
              <div className="mt-auto flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-gold">{formatoMoneda.format(producto.precio)}</p>
                <Button
                  variant="gold"
                  size="sm"
                  disabled={!producto.disponible}
                  onClick={(e) => {
                    e.stopPropagation();
                    pedir(producto);
                  }}
                >
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

      <DetalleProductoModal
        producto={productoSeleccionado}
        open={detalleAbierto}
        onOpenChange={setDetalleAbierto}
        onPedir={pedir}
        onResenasActualizadas={actualizarCalificacionProducto}
      />
    </div>
  );
}
