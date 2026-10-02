import { NavLink } from 'react-router-dom';
import { ClipboardList, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { to: '/', label: 'Catálogo', icon: Package },
  { to: '/pedidos', label: 'Mis pedidos', icon: ClipboardList },
];

export function BottomNav() {
  return (
    // Envoltorio fixed con el padding de safe-area: así la píldora flota separada del borde
    // y del indicador de gestos del sistema, en vez de pegarse a él.
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-5"
      style={{ paddingBottom: 'max(1.125rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
    >
      <div className="mx-auto flex h-16 max-w-sm items-center justify-around rounded-[22px] bg-card px-2.5 shadow-[0_6px_24px_rgba(22,35,59,0.14)] dark:shadow-[0_6px_24px_rgba(0,0,0,0.4)]">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 rounded-2xl px-6 py-2 text-xs font-medium transition-colors motion-reduce:transition-none',
                isActive ? 'bg-gold/15 font-bold text-gold' : 'text-text-muted'
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
