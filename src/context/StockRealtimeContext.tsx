// Misma idea que en el panel interno (stockmanager-web): una conexión en vivo (SignalR) al
// Hub de stock del backend, para que el catálogo se actualice solo cuando el stock de un
// producto cambia (venta de mostrador, cuenta fiada, otro cliente pidiendo por la PWA, etc.),
// sin que el cliente tenga que recargar la página.
//
// Es "mejor esfuerzo": si el Hub no está disponible, el catálogo sigue funcionando igual que
// antes de que existiera esta funcionalidad — solo no se actualiza en vivo.
import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '@/services/api';

export interface CambioStock {
  productoId: number;
  stockActual: number;
}

type Escucha = (cambios: CambioStock[]) => void;

interface StockRealtimeContextValue {
  suscribir: (escucha: Escucha) => () => void;
}

const StockRealtimeContext = createContext<StockRealtimeContextValue | undefined>(undefined);

export function StockRealtimeProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const escuchasRef = useRef<Set<Escucha>>(new Set());

  useEffect(() => {
    if (!token) return;

    const conexion = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/stock`, {
        accessTokenFactory: () => token,
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .build();

    conexion.on('StockActualizado', (cambios: CambioStock[]) => {
      escuchasRef.current.forEach((escucha) => escucha(cambios));
    });

    conexion.start().catch(() => {
      // Sin conexión en vivo, el catálogo sigue mostrando lo que cargó al entrar.
    });

    return () => {
      conexion.stop();
    };
  }, [token]);

  const suscribir = useCallback((escucha: Escucha) => {
    escuchasRef.current.add(escucha);
    return () => {
      escuchasRef.current.delete(escucha);
    };
  }, []);

  return (
    <StockRealtimeContext.Provider value={{ suscribir }}>{children}</StockRealtimeContext.Provider>
  );
}

export function useStockRealtime(): StockRealtimeContextValue {
  const context = useContext(StockRealtimeContext);
  if (!context) {
    throw new Error('useStockRealtime debe usarse dentro de un StockRealtimeProvider');
  }
  return context;
}
