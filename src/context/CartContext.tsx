import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { CartItem } from '../types/cart';
import type { ProductoCatalogo } from '../types/catalogo';

const CART_STORAGE_PREFIX = 'stockmanager_carrito_';

// El catálogo (y por tanto el carrito) solo es visible detrás de
// RutaProtegida, así que nunca hay un carrito "anónimo" que conservar:
// cada carrito se guarda bajo una clave por cliente, para que compartir
// el dispositivo (ej. una tablet familiar) no mezcle los pedidos de
// personas distintas.
function claveCarrito(clienteId: string): string {
  return `${CART_STORAGE_PREFIX}${clienteId}`;
}

interface CartContextValue {
  items: CartItem[];
  cantidadTotal: number;
  totalCarrito: number;
  agregarProducto: (producto: ProductoCatalogo, cantidad?: number) => void;
  actualizarCantidad: (productoId: number, cantidad: number) => void;
  quitarProducto: (productoId: number) => void;
  vaciarCarrito: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  // Al iniciar sesión (o cambiar de cliente) carga el carrito guardado
  // de ESE cliente; al cerrar sesión, el carrito en memoria se vacía
  // (lo guardado en localStorage queda intacto para la próxima vez que
  // ese mismo cliente inicie sesión en este dispositivo).
  useEffect(() => {
    if (!usuario) {
      setItems([]);
      return;
    }
    try {
      const guardado = localStorage.getItem(claveCarrito(usuario.id));
      setItems(guardado ? (JSON.parse(guardado) as CartItem[]) : []);
    } catch {
      setItems([]);
    }
  }, [usuario]);

  useEffect(() => {
    if (!usuario) return;
    localStorage.setItem(claveCarrito(usuario.id), JSON.stringify(items));
  }, [items, usuario]);

  const agregarProducto = useCallback((producto: ProductoCatalogo, cantidad = 1) => {
    setItems((actual) => {
      const existente = actual.find((item) => item.productoId === producto.id);
      if (existente) {
        return actual.map((item) =>
          item.productoId === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item
        );
      }
      return [...actual, { productoId: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad }];
    });
  }, []);

  const actualizarCantidad = useCallback((productoId: number, cantidad: number) => {
    setItems((actual) => {
      if (cantidad <= 0) {
        return actual.filter((item) => item.productoId !== productoId);
      }
      return actual.map((item) => (item.productoId === productoId ? { ...item, cantidad } : item));
    });
  }, []);

  const quitarProducto = useCallback((productoId: number) => {
    setItems((actual) => actual.filter((item) => item.productoId !== productoId));
  }, []);

  const vaciarCarrito = useCallback(() => setItems([]), []);

  const cantidadTotal = useMemo(() => items.reduce((acc, item) => acc + item.cantidad, 0), [items]);
  const totalCarrito = useMemo(() => items.reduce((acc, item) => acc + item.cantidad * item.precio, 0), [items]);

  const value = useMemo(
    () => ({ items, cantidadTotal, totalCarrito, agregarProducto, actualizarCantidad, quitarProducto, vaciarCarrito }),
    [items, cantidadTotal, totalCarrito, agregarProducto, actualizarCantidad, quitarProducto, vaciarCarrito]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
}
