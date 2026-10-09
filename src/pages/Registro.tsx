import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarCliente } from '../services/authService';
import { ApiError } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { MapaDireccion } from '@/components/MapaDireccion';

export function Registro() {
  const [form, setForm] = useState({
    numeroIdentificacion: '',
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    direccion: '',
  });
  // Separado de `form`: Cliente solo guarda la dirección en texto (ver Cliente.cs), las
  // coordenadas no se persisten acá — el pedido en Checkout captura su propia ubicación
  // precisa cada vez (puede ser una dirección de entrega distinta a la de registro). El mapa
  // en este formulario es, igual, un mejor selector de dirección que un campo de texto libre.
  const [ubicacion, setUbicacion] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
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
    <div
      className="flex flex-col overflow-y-auto bg-background px-7 py-8"
      style={{ minHeight: '100dvh', paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto mb-7 flex w-full max-w-sm flex-col items-center">
        <img
          src="/pwa-192.png"
          alt="Ferretería Gold"
          className="mb-3 h-14 w-14 rounded-xl border-2 border-gold object-cover"
        />
        <h1 className="font-heading text-2xl font-extrabold text-navy">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-text-muted">Pide tus productos a domicilio</p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="nombre" className="text-xs font-bold text-navy">
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
          <div className="space-y-1.5">
            <Label htmlFor="numeroIdentificacion" className="text-xs font-bold text-navy">
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
          <div className="space-y-1.5">
            <Label htmlFor="telefono" className="text-xs font-bold text-navy">
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

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold text-navy">
            Correo
          </Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-navy">Dirección de entrega</Label>
          <MapaDireccion
            direccion={form.direccion}
            lat={ubicacion.lat}
            lng={ubicacion.lng}
            onCambiar={({ direccion, lat, lng }) => {
              handleChange('direccion', direccion);
              setUbicacion({ lat, lng });
            }}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-bold text-navy">
            Contraseña
          </Label>
          <PasswordInput
            id="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-error-bg px-3.5 py-2.5 text-sm text-error-text" role="alert">
            {error}
          </div>
        )}
        {exito && (
          <div className="rounded-xl border border-green-200 bg-green/10 px-3.5 py-2.5 text-sm text-green">
            Cuenta creada. Redirigiendo...
          </div>
        )}

        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={enviando || exito}>
          {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>

        <p className="pt-1 text-center text-sm text-text-muted">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-bold text-navy">
            Ingresa
          </Link>
        </p>
      </form>
    </div>
  );
}
