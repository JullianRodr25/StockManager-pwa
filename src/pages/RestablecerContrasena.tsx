import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ApiError } from '../services/api';
import { restablecerContrasena } from '../services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function RestablecerContrasena() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (nuevaPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setEnviando(true);
    try {
      await restablecerContrasena({ token, nuevaPassword });
      toast.success('Contraseña actualizada. Ya podés iniciar sesión.');
      navigate('/login', { replace: true });
    } catch (err) {
      // El backend responde 400 si el enlace es inválido o expiró.
      setError(err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  if (!token) {
    return (
      <div
        className="flex flex-col items-center justify-center overflow-y-auto bg-background px-7 text-center"
        style={{ minHeight: '100dvh' }}
      >
        <p className="text-sm text-text-muted">
          Este enlace no es válido. Solicitá uno nuevo desde la pantalla de inicio de sesión.
        </p>
        <Link to="/olvide-contrasena" className="mt-3 block text-sm font-bold text-gold">
          Solicitar un nuevo enlace
        </Link>
      </div>
    );
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
        <h1 className="font-heading text-2xl font-extrabold text-navy">Restablecer contraseña</h1>
        <p className="mt-2 text-sm text-text-muted">Elegí una nueva contraseña para tu cuenta.</p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="nuevaPassword" className="text-xs font-bold text-navy">
            Nueva contraseña
          </Label>
          <Input
            id="nuevaPassword"
            type="password"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmarPassword" className="text-xs font-bold text-navy">
            Confirmar contraseña
          </Label>
          <Input
            id="confirmarPassword"
            type="password"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-error-bg px-3.5 py-2.5 text-sm text-error-text" role="alert">
            {error}
          </div>
        )}

        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={enviando}>
          {enviando ? 'Guardando...' : 'Guardar nueva contraseña'}
        </Button>
      </form>
    </div>
  );
}
