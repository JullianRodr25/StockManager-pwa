import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';

export function Login() {
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    try {
      await login(identificador, password);
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('No se pudo conectar con el servidor. Intenta de nuevo.');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    // Pantalla completa sin "tarjeta flotante" ni sombra: en una app nativa, el login ES la
    // pantalla, no un recuadro centrado sobre un fondo vacío (eso es lo que más delata una
    // página web adaptada). padding-top/bottom con env(safe-area-inset-*) para respetar el
    // notch y la barra de gestos cuando la PWA está instalada.
    <div
      className="flex flex-col justify-center overflow-y-auto bg-background px-7"
      style={{
        // 100dvh en vez de min-h-screen (100vh): en el navegador del teléfono, 100vh cuenta el
        // espacio detrás de la barra de direcciones aunque no sea visible, así que la página
        // queda más alta que la pantalla real y aparece un scroll/salto raro aunque el
        // contenido quepa perfecto. dvh ("dynamic viewport height") sí se ajusta al alto
        // visible de verdad.
        minHeight: '100dvh',
        paddingTop: 'max(2rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="mx-auto mb-9 flex w-full max-w-sm flex-col items-center">
        <img
          src="/pwa-192.png"
          alt="Ferretería Gold"
          className="mb-4 h-[72px] w-[72px] rounded-2xl border-[3px] border-gold object-cover"
        />
        <h1 className="font-heading text-2xl font-extrabold text-navy">Ferretería Gold</h1>
        <p className="mt-1 text-sm text-text-muted">Pide tus productos a domicilio</p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="identificador" className="text-xs font-bold text-navy">
            Cédula o correo
          </Label>
          <Input
            id="identificador"
            type="text"
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
            placeholder="Tu cédula o correo@ejemplo.com"
            autoComplete="username"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-bold text-navy">
            Contraseña
          </Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Link to="/olvide-contrasena" className="block pt-0.5 text-right text-xs font-medium text-gold">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {error && (
          <div
            className="rounded-xl border border-red-200 bg-error-bg px-3.5 py-2.5 text-sm text-error-text"
            role="alert"
          >
            {error}
          </div>
        )}

        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={enviando}>
          {enviando ? 'Ingresando...' : 'Ingresar'}
        </Button>

        <p className="pt-1 text-center text-sm text-text-muted">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" className="font-bold text-navy">
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}
