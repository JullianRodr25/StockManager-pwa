import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { formatoMoneda } from '@/lib/formato';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, totalCarrito, actualizarCantidad, quitarProducto } = useCart();
  const navigate = useNavigate();

  function irAPagar() {
    onOpenChange(false);
    navigate('/checkout');
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Tu carrito</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-text-muted">
            <ShoppingBag className="h-10 w-10" />
            <p className="text-sm">Tu carrito está vacío.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto py-2">
              {items.map((item) => (
                <div
                  key={item.productoId}
                  className="flex items-start justify-between gap-3 border-b border-border pb-4 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy">{item.nombre}</p>
                    <p className="text-xs text-text-muted">{formatoMoneda.format(item.precio)} c/u</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium text-navy">{item.cantidad}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)}
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm font-semibold text-gold">
                      {formatoMoneda.format(item.precio * item.cantidad)}
                    </p>
                    <button
                      type="button"
                      onClick={() => quitarProducto(item.productoId)}
                      className="text-text-muted hover:text-error-text"
                      aria-label="Quitar del carrito"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between text-base font-semibold text-navy">
                <span>Total</span>
                <span>{formatoMoneda.format(totalCarrito)}</span>
              </div>
              <Button variant="gold" className="w-full" onClick={irAPagar}>
                Ir a pagar
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
