import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { CartFab } from './CartFab';
import { CartSheet } from '../CartSheet';

export function AppLayout() {
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Topbar />
      <main
        className="flex-1 p-4 sm:p-6 md:p-8"
        // Deja espacio de sobra para que el contenido no quede tapado detrás de la píldora de
        // navegación flotante (altura + su propio padding de safe-area).
        style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Outlet />
      </main>
      <CartFab onClick={() => setCarritoAbierto(true)} />
      <BottomNav />
      <CartSheet open={carritoAbierto} onOpenChange={setCarritoAbierto} />
    </div>
  );
}
