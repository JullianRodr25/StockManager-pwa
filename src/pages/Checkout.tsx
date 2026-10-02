import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { crearPedido } from '@/services/pedidoService';
import { ApiError } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MapaDireccion } from '@/components/MapaDireccion';
import { formatoMoneda } from '@/lib/formato';

export function Checkout() {
  const { token } = useAuth();
  const { items, totalCarrito, vaciarCarrito } = useCart();
  const [ubicacion, setUbicacion] = useState<{ direccion: string; lat: number | null; lng: number | null }>({
    direccion: '',
    lat: null,
    lng: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    try {
      await crearPedido(
        {
          direccion: ubicacion.direccion,
          latitud: ubicacion.lat ?? undefined,
          longitud: ubicacion.lng ?? undefined,
          lineas: items.map((item) => ({ productoId: item.productoId, cantidad: item.cantidad })),
        },
        token
      );
      vaciarCarrito();
      toast.success('¡Pedido realizado! Te avisaremos cuando esté en camino.');
      navigate('/pedidos', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el pedido. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-text-muted">Tu carrito está vacío.</p>
        <Button variant="gold" onClick={() => navigate('/')}>
          Ver catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-navy">Confirmar pedido</h1>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Resumen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.productoId} className="flex items-center justify-between text-sm">
              <span className="text-navy">
                {item.cantidad} × {item.nombre}
              </span>
              <span className="font-medium text-navy">{formatoMoneda.format(item.precio * item.cantidad)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold text-navy">
            <span>Total</span>
            <span className="text-gold">{formatoMoneda.format(totalCarrito)}</span>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1 text-xs font-bold text-navy">
            <MapPin className="h-4 w-4" /> Dirección de entrega
          </Label>
          <MapaDireccion
            direccion={ubicacion.direccion}
            lat={ubicacion.lat}
            lng={ubicacion.lng}
            onCambiar={setUbicacion}
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-error-bg px-3.5 py-2.5 text-sm text-error-text" role="alert">
            {error}
          </div>
        )}

        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={enviando}>
          {enviando ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" /> Enviando pedido...
            </>
          ) : (
            'Confirmar pedido'
          )}
        </Button>

        <p className="text-center text-xs text-text-muted">
          Pagas contra entrega. El repartidor confirmará el método de pago al recibir tu pedido.
        </p>
      </form>
    </div>
  );
}
