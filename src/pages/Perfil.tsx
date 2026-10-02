import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Loader2, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/api';
import { actualizarMiCuenta, cambiarPasswordPropio, obtenerMiCuenta } from '@/services/cuentaService';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function obtenerIniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('');
}

export function Perfil() {
  const { token, usuario, actualizarUsuario } = useAuth();

  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [datos, setDatos] = useState({ nombre: '', email: '', telefono: '', direccion: '' });
  const [errorDatos, setErrorDatos] = useState<string | null>(null);
  const [guardandoDatos, setGuardandoDatos] = useState(false);

  const [passwords, setPasswords] = useState({ actual: '', nueva: '', confirmar: '' });
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [cambiandoPassword, setCambiandoPassword] = useState(false);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const cliente = await obtenerMiCuenta(token);
        if (cancelado) return;
        setDatos({
          nombre: cliente.nombre,
          email: cliente.email,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
        });
      } catch (err) {
        if (!cancelado) {
          setErrorCarga(err instanceof ApiError ? err.message : 'No se pudieron cargar tus datos.');
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [token]);

  async function handleGuardarDatos(e: FormEvent) {
    e.preventDefault();
    setErrorDatos(null);
    setGuardandoDatos(true);
    try {
      const actualizado = await actualizarMiCuenta(datos, token);
      setDatos({
        nombre: actualizado.nombre,
        email: actualizado.email,
        telefono: actualizado.telefono,
        direccion: actualizado.direccion,
      });
      // El token no se reemite al editar el perfil (el nombre no tiene peso de seguridad), así
      // que se refresca en memoria para que Topbar y el saludo del catálogo no muestren el
      // nombre viejo hasta el próximo login.
      actualizarUsuario({ nombre: actualizado.nombre });
      toast.success('Tus datos se actualizaron correctamente.');
    } catch (err) {
      setErrorDatos(err instanceof ApiError ? err.message : 'No se pudieron guardar los cambios.');
    } finally {
      setGuardandoDatos(false);
    }
  }

  async function handleCambiarPassword(e: FormEvent) {
    e.preventDefault();
    setErrorPassword(null);

    if (passwords.nueva !== passwords.confirmar) {
      setErrorPassword('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    setCambiandoPassword(true);
    try {
      await cambiarPasswordPropio({ passwordActual: passwords.actual, passwordNueva: passwords.nueva }, token);
      setPasswords({ actual: '', nueva: '', confirmar: '' });
      toast.success('Tu contraseña se actualizó correctamente.');
    } catch (err) {
      setErrorPassword(err instanceof ApiError ? err.message : 'No se pudo cambiar la contraseña.');
    } finally {
      setCambiandoPassword(false);
    }
  }

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gold motion-reduce:animate-none" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="flex flex-col items-center gap-3 pt-2">
        <Avatar className="h-20 w-20 border-[3px] border-gold">
          <AvatarFallback className="text-xl font-semibold">
            {usuario ? obtenerIniciales(usuario.nombre) : '??'}
          </AvatarFallback>
        </Avatar>

        <h1 className="font-heading text-xl font-bold text-navy">{datos.nombre}</h1>
      </div>

      {errorCarga && (
        <div className="rounded-xl border border-red-200 bg-error-bg px-3.5 py-2.5 text-sm text-error-text" role="alert">
          {errorCarga}
        </div>
      )}

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-gold" /> Editar datos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGuardarDatos} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-xs font-bold text-navy">
                Nombre
              </Label>
              <Input
                id="nombre"
                value={datos.nombre}
                onChange={(e) => setDatos((prev) => ({ ...prev, nombre: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-navy">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={datos.email}
                onChange={(e) => setDatos((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefono" className="text-xs font-bold text-navy">
                Teléfono
              </Label>
              <Input
                id="telefono"
                value={datos.telefono}
                onChange={(e) => setDatos((prev) => ({ ...prev, telefono: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="direccion" className="text-xs font-bold text-navy">
                Dirección
              </Label>
              <Input
                id="direccion"
                value={datos.direccion}
                onChange={(e) => setDatos((prev) => ({ ...prev, direccion: e.target.value }))}
                required
              />
            </div>

            {errorDatos && (
              <div className="rounded-xl border border-red-200 bg-error-bg px-3.5 py-2.5 text-sm text-error-text" role="alert">
                {errorDatos}
              </div>
            )}

            <Button type="submit" variant="gold" className="w-full" disabled={guardandoDatos}>
              {guardandoDatos ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" /> Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5 text-gold" /> Restablecer contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCambiarPassword} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="passwordActual" className="text-xs font-bold text-navy">
                Contraseña actual
              </Label>
              <Input
                id="passwordActual"
                type="password"
                value={passwords.actual}
                onChange={(e) => setPasswords((prev) => ({ ...prev, actual: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="passwordNueva" className="text-xs font-bold text-navy">
                Nueva contraseña
              </Label>
              <Input
                id="passwordNueva"
                type="password"
                minLength={8}
                value={passwords.nueva}
                onChange={(e) => setPasswords((prev) => ({ ...prev, nueva: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="passwordConfirmar" className="text-xs font-bold text-navy">
                Confirmar nueva contraseña
              </Label>
              <Input
                id="passwordConfirmar"
                type="password"
                minLength={8}
                value={passwords.confirmar}
                onChange={(e) => setPasswords((prev) => ({ ...prev, confirmar: e.target.value }))}
                required
              />
            </div>

            {errorPassword && (
              <div className="rounded-xl border border-red-200 bg-error-bg px-3.5 py-2.5 text-sm text-error-text" role="alert">
                {errorPassword}
              </div>
            )}

            <Button type="submit" variant="outline" className="w-full" disabled={cambiandoPassword}>
              {cambiandoPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" /> Actualizando...
                </>
              ) : (
                'Actualizar contraseña'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
