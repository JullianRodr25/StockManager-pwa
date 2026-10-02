import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../services/api';
import { solicitarRecuperacion } from '../services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function OlvideContrasena() {
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    try {
      const respuesta = await solicitarRecuperacion({ email });
      // El backend responde con el mismo mensaje exista o no el email; se muestra tal cual,
      // sin distinguir casos, para no filtrar qué correos están registrados.
      setMensaje(respuesta.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="flex flex-col justify-center overflow-y-auto bg-background px-7"
      style={{
        minHeight: '100dvh',
        paddingTop: 'max(2rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="mx-auto mb-7 w-full max-w-sm text-center">
        <h1 className="font-heading text-2xl font-extrabold text-navy">¿Olvidaste tu contraseña?</h1>
        <p className="mt-2 text-sm text-text-muted">
          Escribí tu correo y, si está registrado, te enviaremos un enlace para restablecerla.
        </p>
      </div>

      <div className="mx-auto w-full max-w-sm">
        {mensaje ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-green/30 bg-green/10 px-3.5 py-2.5 text-sm text-navy" role="status">
              {mensaje}
            </div>
            <Link to="/login" className="block text-center text-sm font-bold text-gold">
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-navy">
                Correo
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-error-bg px-3.5 py-2.5 text-sm text-error-text" role="alert">
                {error}
              </div>
            )}

            <Button type="submit" variant="gold" size="lg" className="w-full" disabled={enviando}>
              {enviando ? 'Enviando...' : 'Enviar enlace'}
            </Button>

            <Link to="/login" className="block pt-1 text-center text-sm text-text-muted">
              Volver a iniciar sesión
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
