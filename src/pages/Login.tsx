import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md items-center">
        <Card className="w-full border-border bg-white/95 shadow-xl">
          <CardHeader className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold bg-navy font-heading text-lg font-extrabold text-gold">
              FG
            </div>
            <div className="space-y-1 text-center">
              <CardTitle className="text-3xl text-navy">Ferretería Gold</CardTitle>
              <CardDescription>Ingresa para pedir a domicilio</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="identificador" className="text-navy">
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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-navy">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && (
                <div
                  className="rounded-md border border-red-200 bg-error-bg px-3 py-2 text-sm text-error-text"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="gold"
                className="w-full font-heading text-sm uppercase tracking-wide"
                disabled={enviando}
              >
                {enviando ? 'Ingresando...' : 'Ingresar'}
              </Button>

              <p className="text-center text-sm text-text-muted">
                ¿Aún no tienes cuenta?{' '}
                <Link to="/registro" className="font-medium text-navy hover:underline">
                  Regístrate
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
