import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { decodeJwt, isTokenExpired } from '../services/jwt';
import { loginCliente } from '../services/authService';
import type { ClienteAutenticado } from '../types/auth';
import { ApiError } from '../services/api';

const TOKEN_STORAGE_KEY = 'stockmanager_cliente_token';

interface AuthContextValue {
  usuario: ClienteAutenticado | null;
  token: string | null;
  cargando: boolean;
  login: (identificador: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function construirUsuarioDesdeToken(token: string): ClienteAutenticado | null {
  const payload = decodeJwt(token);
  if (!payload) return null;
  return {
    id: payload.sub,
    numeroIdentificacion: payload.unique_name,
    nombre: payload.given_name,
    rol: payload.role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<ClienteAutenticado | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const tokenGuardado = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (tokenGuardado && !isTokenExpired(tokenGuardado)) {
      setToken(tokenGuardado);
      setUsuario(construirUsuarioDesdeToken(tokenGuardado));
    } else if (tokenGuardado) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setCargando(false);
  }, []);

  const login = useCallback(async (identificador: string, password: string) => {
    const { token: nuevoToken } = await loginCliente({ identificador, password });
    localStorage.setItem(TOKEN_STORAGE_KEY, nuevoToken);
    setToken(nuevoToken);
    setUsuario(construirUsuarioDesdeToken(nuevoToken));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

export { ApiError };
