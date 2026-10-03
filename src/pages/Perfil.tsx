import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Camera, Loader2, Lock, MapPin, User, X } from 'lucide-react';
import { PantallaCargaLogo } from '@/components/PantallaCargaLogo';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/api';
import {
  actualizarMiCuenta,
  cambiarPasswordPropio,
  eliminarFotoPerfil,
  obtenerMiCuenta,
  subirFotoPerfil,
} from '@/services/cuentaService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapaDireccion } from '@/components/MapaDireccion';

const TIPOS_FOTO_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO_FOTO_BYTES = 5 * 1024 * 1024; // 5 MB

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

  const [datos, setDatos] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    lat: null as number | null,
    lng: null as number | null,
  });
  const [errorDatos, setErrorDatos] = useState<string | null>(null);
  const [guardandoDatos, setGuardandoDatos] = useState(false);

  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [eliminandoFoto, setEliminandoFoto] = useState(false);
  const inputFotoRef = useRef<HTMLInputElement>(null);

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
          lat: cliente.latitud,
          lng: cliente.longitud,
        });
        setFotoUrl(cliente.fotoUrl);
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
      const actualizado = await actualizarMiCuenta(
        {
          nombre: datos.nombre,
          email: datos.email,
          telefono: datos.telefono,
          direccion: datos.direccion,
          latitud: datos.lat,
          longitud: datos.lng,
        },
        token
      );
      setDatos({
        nombre: actualizado.nombre,
        email: actualizado.email,
        telefono: actualizado.telefono,
        direccion: actualizado.direccion,
        lat: actualizado.latitud,
        lng: actualizado.longitud,
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

  async function handleSeleccionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo si se cancela y reintenta

    if (!archivo) return;

    if (!TIPOS_FOTO_PERMITIDOS.includes(archivo.type)) {
      toast.error('Solo se permiten imágenes JPG, PNG o WEBP.');
      return;
    }
    if (archivo.size > TAMANO_MAXIMO_FOTO_BYTES) {
      toast.error('La imagen no puede superar los 5 MB.');
      return;
    }

    setSubiendoFoto(true);
    try {
      const actualizado = await subirFotoPerfil(archivo, token);
      setFotoUrl(actualizado.fotoUrl);
      toast.success('Foto de perfil actualizada.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudo subir la foto.');
    } finally {
      setSubiendoFoto(false);
    }
  }

  async function handleEliminarFoto() {
    setEliminandoFoto(true);
    try {
      const actualizado = await eliminarFotoPerfil(token);
      setFotoUrl(actualizado.fotoUrl);
      toast.success('Foto de perfil eliminada.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudo eliminar la foto.');
    } finally {
      setEliminandoFoto(false);
    }
  }

  if (cargando) {
    return <PantallaCargaLogo variante="en-linea" />;
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="relative">
          <Avatar className="h-20 w-20 border-[3px] border-gold">
            {fotoUrl && <AvatarImage src={fotoUrl} alt="Foto de perfil" />}
            <AvatarFallback className="text-xl font-semibold">
              {usuario ? obtenerIniciales(usuario.nombre) : '??'}
            </AvatarFallback>
          </Avatar>

          <button
            type="button"
            onClick={() => inputFotoRef.current?.click()}
            disabled={subiendoFoto || eliminandoFoto}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gold text-navy shadow-sm disabled:opacity-60"
            aria-label="Cambiar foto de perfil"
          >
            {subiendoFoto ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
          </button>

          {fotoUrl && (
            <button
              type="button"
              onClick={handleEliminarFoto}
              disabled={subiendoFoto || eliminandoFoto}
              className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-white text-error-text shadow-sm disabled:opacity-60"
              aria-label="Eliminar foto de perfil"
            >
              {eliminandoFoto ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          <input
            ref={inputFotoRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleSeleccionarFoto}
          />
        </div>

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
              <Label className="flex items-center gap-1 text-xs font-bold text-navy">
                <MapPin className="h-3.5 w-3.5" /> Dirección
              </Label>
              <MapaDireccion
                direccion={datos.direccion}
                lat={datos.lat}
                lng={datos.lng}
                onCambiar={({ direccion, lat, lng }) => setDatos((prev) => ({ ...prev, direccion, lat, lng }))}
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
