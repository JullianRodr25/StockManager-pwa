import { Moon, ShoppingCart, Sun } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function obtenerIniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('');
}

interface TopbarProps {
  onCartClick: () => void;
}

export function Topbar({ onCartClick }: TopbarProps) {
  const { usuario, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { cantidadTotal } = useCart();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <img src="/pwa-192.png" alt="" className="h-8 w-8 shrink-0 rounded-lg border-2 border-gold object-cover" />
        <span className="font-heading text-sm font-semibold text-navy">Ferretería Gold</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-md text-navy hover:bg-accent hover:text-accent-foreground"
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button
          type="button"
          onClick={onCartClick}
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-navy hover:bg-accent hover:text-accent-foreground"
          aria-label="Carrito de compras"
        >
          <ShoppingCart className="h-5 w-5" />
          {cantidadTotal > 0 && (
            <Badge
              variant="gold"
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.65rem]"
            >
              {cantidadTotal}
            </Badge>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1 outline-none hover:bg-accent">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs font-semibold">
                {usuario ? obtenerIniciales(usuario.nombre) : '??'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="text-sm font-medium text-navy">{usuario?.nombre}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-error-text focus:text-error-text">
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
