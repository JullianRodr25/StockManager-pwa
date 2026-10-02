import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface CartFabProps {
  onClick: () => void;
}

export function CartFab({ onClick }: CartFabProps) {
  const { cantidadTotal } = useCart();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Carrito de compras"
      className="fixed left-1/2 z-50 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-gold text-navy shadow-[0_8px_22px_rgba(201,162,39,0.45)] transition-transform motion-reduce:transition-none active:scale-95"
      style={{
        // Flota justo encima de la píldora de BottomNav: su altura (h-16 = 4rem) más su propio
        // padding-bottom (que ya contempla el safe-area), más un pequeño espacio de aire.
        bottom: 'calc(4rem + max(1.125rem, env(safe-area-inset-bottom) + 0.5rem) + 0.75rem)',
      }}
    >
      <ShoppingCart className="h-6 w-6" />
      {cantidadTotal > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-navy px-1 text-[0.65rem] font-bold text-white">
          {cantidadTotal}
        </span>
      )}
    </button>
  );
}
