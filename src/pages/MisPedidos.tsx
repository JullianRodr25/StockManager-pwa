import { useCallback, useEffect, useState } from 'react';
import { Loader2, MapPin, PackageSearch } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/api';
import { obtenerMisPedidos, obtenerPedidoPorId } from '@/services/pedidoService';
import type { EstadoLineaPedido, EstadoPedido, PedidoResponse, PedidoResumenResponse } from '@/types/pedidos';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatoFecha, formatoMoneda } from '@/lib/formato';

const TAMANO_PAGINA = 10;

const ETIQUETA_ESTADO: Record<EstadoPedido, string> = {
  Pendiente: 'Pendiente',
  Confirmado: 'Confirmado',
  EnPreparacion: 'En preparación',
  EnCamino: 'En camino',
  Entregado: 'Entregado',
  Cancelado: 'Cancelado',
};

const ESTILO_ESTADO: Record<EstadoPedido, string> = {
  Pendiente: 'border-transparent bg-gold/15 text-gold',
  Confirmado: 'border-transparent bg-primary/15 text-primary',
  EnPreparacion: 'border-transparent bg-primary/15 text-primary',
  EnCamino: 'border-transparent bg-gold/20 text-gold',
  Entregado: 'border-transparent bg-green/10 text-green',
  Cancelado: 'border-transparent bg-error-bg text-error-text',
};

function BadgeEstadoPedido({ estado }: { estado: EstadoPedido }) {
  return <Badge className={ESTILO_ESTADO[estado]}>{ETIQUETA_ESTADO[estado]}</Badge>;
}

function BadgeEstadoLinea({ estado }: { estado: EstadoLineaPedido }) {
  if (estado === 'PorEncargo') {
    return <Badge className="border-transparent bg-gold/15 text-xs text-gold">Por encargo</Badge>;
  }
  return <Badge className="border-transparent bg-green/10 text-xs text-green">Disponible</Badge>;
}

export function MisPedidos() {
  const { token } = useAuth();

  const [pedidos, setPedidos] = useState<PedidoResumenResponse[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoResponse | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const cargarPedidos = useCallback(
    async (paginaSolicitada: number) => {
      setCargando(true);
      setError(null);
      try {
        const respuesta = await obtenerMisPedidos(paginaSolicitada, TAMANO_PAGINA, token);
        setPedidos(respuesta.data);
        setPagina(respuesta.pagina);
        setTotalPaginas(respuesta.totalPaginas);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'No se pudieron cargar tus pedidos.');
      } finally {
        setCargando(false);
      }
    },
    [token]
  );

  useEffect(() => {
    cargarPedidos(1);
    // Solo debe recargar cuando cambia el token; cargarPedidos ya lo tiene como dependencia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function verDetalle(id: number) {
    setCargandoDetalle(true);
    try {
      const detalle = await obtenerPedidoPorId(id, token);
      setPedidoSeleccionado(detalle);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar el detalle del pedido.');
    } finally {
      setCargandoDetalle(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-navy">Mis pedidos</h1>

      {error && (
        <div className="rounded-md border border-red-200 bg-error-bg px-3 py-2 text-sm text-error-text" role="alert">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gold motion-reduce:animate-none" />
        </div>
      ) : pedidos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center text-text-muted">
          <PackageSearch className="h-10 w-10" />
          <p className="text-sm">Todavía no has hecho ningún pedido.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pedidos.map((pedido) => (
            <Card
              key={pedido.id}
              role="button"
              tabIndex={0}
              onClick={() => verDetalle(pedido.id)}
              onKeyDown={(e) => e.key === 'Enter' && verDetalle(pedido.id)}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl p-4 transition-colors motion-reduce:transition-none active:scale-[0.98] hover:border-gold/50"
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-navy">Pedido #{pedido.id}</p>
                <p className="text-xs text-text-muted">{formatoFecha.format(new Date(pedido.fecha))}</p>
                {pedido.tieneLineasPorEncargo && (
                  <Badge className="w-fit border-transparent bg-gold/15 text-xs text-gold">
                    Con productos por encargo
                  </Badge>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <p className="text-sm font-semibold text-gold">{formatoMoneda.format(pedido.total)}</p>
                <BadgeEstadoPedido estado={pedido.estado} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {!cargando && pedidos.length > 0 && totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={pagina <= 1} onClick={() => cargarPedidos(pagina - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-text-muted">
            Página {pagina} de {totalPaginas}
          </span>
          <Button variant="outline" size="sm" disabled={pagina >= totalPaginas} onClick={() => cargarPedidos(pagina + 1)}>
            Siguiente
          </Button>
        </div>
      )}

      <Dialog open={pedidoSeleccionado !== null || cargandoDetalle} onOpenChange={(open) => !open && setPedidoSeleccionado(null)}>
        <DialogContent>
          {cargandoDetalle || !pedidoSeleccionado ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gold motion-reduce:animate-none" />
            </div>
          ) : (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2 pr-6">
                  <DialogTitle>Pedido #{pedidoSeleccionado.id}</DialogTitle>
                  <BadgeEstadoPedido estado={pedidoSeleccionado.estado} />
                </div>
              </DialogHeader>

              <div className="flex items-center gap-1.5 text-sm text-text-muted">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{pedidoSeleccionado.direccion}</span>
                {pedidoSeleccionado.latitud != null && pedidoSeleccionado.longitud != null && (
                  <a
                    href={`https://www.google.com/maps?q=${pedidoSeleccionado.latitud},${pedidoSeleccionado.longitud}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs font-medium text-gold hover:underline"
                  >
                    Ver en el mapa
                  </a>
                )}
              </div>
              <p className="text-xs text-text-muted">{formatoFecha.format(new Date(pedidoSeleccionado.fecha))}</p>

              <div className="flex flex-col gap-3 border-t border-border pt-3">
                {pedidoSeleccionado.detalles.map((detalle) => (
                  <div key={detalle.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex flex-col">
                      <span className="text-navy">
                        {detalle.cantidad} × {detalle.productoNombre}
                      </span>
                      <BadgeEstadoLinea estado={detalle.estadoLinea} />
                    </div>
                    <span className="font-medium text-navy">{formatoMoneda.format(detalle.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold text-navy">
                <span>Total</span>
                <span>{formatoMoneda.format(pedidoSeleccionado.total)}</span>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
