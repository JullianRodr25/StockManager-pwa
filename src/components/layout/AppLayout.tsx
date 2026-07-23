import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar';

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Topbar />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
