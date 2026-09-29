import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { CartSheet } from '../CartSheet';

export function AppLayout() {
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Topbar onCartClick={() => setCarritoAbierto(true)} />
      <main className="flex-1 p-4 pb-24 sm:p-6 md:p-8">
        <Outlet />
      </main>
      <BottomNav />
      <CartSheet open={carritoAbierto} onOpenChange={setCarritoAbierto} />
    </div>
  );
}
