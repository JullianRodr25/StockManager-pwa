import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarCliente } from '../services/authService';
import { ApiError } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Registro() {
  const [form, setForm] = useState({
    numeroIdentificacion: '',
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    direccion: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  function handleChange(campo: keyof typeof form, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    try {
      await registrarCliente(form);
      setExito(true);
      // Pequeña pausa para que el mensaje de éxito sea visible antes
      // de mandar al usuario a loguearse con su cuenta recién creada.
      setTimeout(() => navigate('/login', { replace: true }), 1200);
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
              <CardTitle className="text-3xl text-navy">Crea tu cuenta</CardTitle>
              <CardDescription>Pide tus productos a domicilio</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-navy">
                  Nombre completo
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="numeroIdentificacion" className="text-navy">
                    Cédula
                  </Label>
                  <Input
                    id="numeroIdentificacion"
                    type="text"
                    value={form.numeroIdentificacion}
                    onChange={(e) => handleChange('numeroIdentificacion', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-navy">
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    placeholder="Para WhatsApp"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-navy">
                  Correo
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion" className="text-navy">
                  Dirección de entrega
                </Label>
                <Input
                  id="direccion"
                  type="text"
                  value={form.direccion}
                  onChange={(e) => handleChange('direccion', e.target.value)}
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
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
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
              {exito && (
                <div className="rounded-md border border-green-200 bg-green/10 px-3 py-2 text-sm text-green">
                  Cuenta creada. Redirigiendo...
                </div>
              )}

              <Button
                type="submit"
                variant="gold"
                className="w-full font-heading text-sm uppercase tracking-wide"
                disabled={enviando || exito}
              >
                {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>

              <p className="text-center text-sm text-text-muted">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="font-medium text-navy hover:underline">
                  Ingresa
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
