import { NavLink } from 'react-router-dom';
import { ClipboardList, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { to: '/', label: 'Catálogo', icon: Package },
  { to: '/pedidos', label: 'Mis pedidos', icon: ClipboardList },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-card">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors motion-reduce:transition-none',
              isActive ? 'text-gold' : 'text-text-muted'
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
