import { useEffect, useState } from 'react';
import { Loader2, MessageSquareOff, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/api';
import { crearResena, editarResena, eliminarResena, listarResenas } from '@/services/resenasService';
import type { Resena } from '@/types/resena';
import type { ProductoCatalogo } from '@/types/catalogo';
import { CarruselFotosProducto } from '@/components/CarruselFotosProducto';
import { Estrellas } from '@/components/Estrellas';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { formatoFecha, formatoMoneda } from '@/lib/formato';

interface DetalleProductoModalProps {
  producto: ProductoCatalogo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPedir: (producto: ProductoCatalogo) => void;
  /// Avisa al catálogo que el promedio/total de reseñas de este producto cambió, para que la
  /// tarjeta en la grilla se actualice sin recargar toda la página.
  onResenasActualizadas: (productoId: number, calificacionPromedio: number | null, totalResenas: number) => void;
}

/// Modal de detalle de un producto (fotos grandes + reseñas), abierto desde la tarjeta del
/// catálogo. Es un Sheet (no un Dialog centrado) a propósito: en móvil, deslizar desde abajo
/// se siente más nativo para un panel que puede crecer bastante con la lista de reseñas.
export function DetalleProductoModal({
  producto,
  open,
  onOpenChange,
  onPedir,
  onResenasActualizadas,
}: DetalleProductoModalProps) {
  const { token } = useAuth();

  const [resenas, setResenas] = useState<Resena[]>([]);
  const [cargandoResenas, setCargandoResenas] = useState(false);
  const [errorResenas, setErrorResenas] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !producto) return;

    let cancelado = false;
    setCargandoResenas(true);
    setErrorResenas(null);

    listarResenas(producto.id, token)
      .then((data) => {
        if (!cancelado) setResenas(data);
      })
      .catch((err) => {
        if (!cancelado) {
          setErrorResenas(err instanceof ApiError ? err.message : 'No se pudieron cargar las reseñas.');
        }
      })
      .finally(() => {
        if (!cancelado) setCargandoResenas(false);
      });

    return () => {
      cancelado = true;
    };
  }, [open, producto, token]);

  if (!producto) return null;

  const miResena = resenas.find((r) => r.esPropia) ?? null;
  const otrasResenas = resenas.filter((r) => !r.esPropia);

  function actualizarListaYProducto(nuevasResenas: Resena[]) {
    setResenas(nuevasResenas);
    const total = nuevasResenas.length;
    const promedio =
      total === 0 ? null : nuevasResenas.reduce((suma, r) => suma + r.calificacion, 0) / total;
    onResenasActualizadas(producto!.id, promedio == null ? null : Math.round(promedio * 100) / 100, total);
  }

  async function handleCrear(calificacion: number, comentario: string) {
    const nueva = await crearResena(producto!.id, { calificacion, comentario: comentario || null }, token);
    actualizarListaYProducto([nueva, ...resenas]);
    toast.success('Reseña publicada.');
  }

  async function handleEditar(resenaId: number, calificacion: number, comentario: string) {
    const actualizada = await editarResena(producto!.id, resenaId, { calificacion, comentario: comentario || null }, token);
    actualizarListaYProducto(resenas.map((r) => (r.id === resenaId ? actualizada : r)));
    toast.success('Reseña actualizada.');
  }

  async function handleEliminar(resenaId: number) {
    await eliminarResena(producto!.id, resenaId, token);
    actualizarListaYProducto(resenas.filter((r) => r.id !== resenaId));
    toast.success('Reseña eliminada.');
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="flex h-[92vh] flex-col gap-0 overflow-hidden rounded-t-2xl p-0">
        <SheetHeader className="shrink-0 border-b border-border px-5 pb-4 pt-5 text-left">
          <SheetTitle className="sr-only">{producto.nombre}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <CarruselFotosProducto fotos={producto.fotos} nombre={producto.nombre} alto="h-64" />

          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <p className="font-heading text-lg font-bold text-navy">{producto.nombre}</p>
              <p className="text-sm text-text-muted">{producto.categoriaNombre}</p>
            </div>
            <Badge
              variant={producto.disponible ? 'default' : 'destructive'}
              className={producto.disponible ? 'border-transparent bg-green text-white' : ''}
            >
              {producto.disponible ? 'Disponible' : 'Agotado'}
            </Badge>
          </div>

          <div className="mt-2 flex items-center gap-2">
            {producto.totalResenas > 0 ? (
              <>
                <Estrellas valor={producto.calificacionPromedio ?? 0} tamano="sm" />
                <span className="text-sm text-text-muted">
                  {producto.calificacionPromedio?.toFixed(1)} ({producto.totalResenas}{' '}
                  {producto.totalResenas === 1 ? 'reseña' : 'reseñas'})
                </span>
              </>
            ) : (
              <span className="text-sm text-text-muted">Todavía sin reseñas</span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-gold/10 px-4 py-3">
            <p className="text-base font-bold text-gold">{formatoMoneda.format(producto.precio)}</p>
            <Button
              variant="gold"
              size="sm"
              disabled={!producto.disponible}
              onClick={() => onPedir(producto)}
            >
              Pedir
            </Button>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <h2 className="font-heading text-base font-bold text-navy">Reseñas</h2>

            {cargandoResenas ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-gold motion-reduce:animate-none" />
              </div>
            ) : errorResenas ? (
              <p className="text-sm text-error-text">{errorResenas}</p>
            ) : (
              <>
                <SeccionMiResena
                  key={producto.id}
                  productoId={producto.id}
                  miResena={miResena}
                  onCrear={handleCrear}
                  onEditar={handleEditar}
                  onEliminar={handleEliminar}
                />

                {otrasResenas.length === 0 && !miResena ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-center text-text-muted">
                    <MessageSquareOff className="h-8 w-8" />
                    <p className="text-sm">Sé el primero en dejar una reseña.</p>
                  </div>
                ) : (
                  otrasResenas.map((resena) => <ItemResena key={resena.id} resena={resena} />)
                )}
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ItemResena({ resena }: { resena: Resena }) {
  return (
    <div className="border-b border-border pb-4 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-navy">{resena.clienteNombre}</p>
        <p className="text-xs text-text-muted">{formatoFecha.format(new Date(resena.fechaCreacion))}</p>
      </div>
      <Estrellas valor={resena.calificacion} tamano="sm" />
      {resena.comentario && <p className="mt-1.5 text-sm text-navy">{resena.comentario}</p>}
    </div>
  );
}

interface SeccionMiResenaProps {
  productoId: number;
  miResena: Resena | null;
  onCrear: (calificacion: number, comentario: string) => Promise<void>;
  onEditar: (resenaId: number, calificacion: number, comentario: string) => Promise<void>;
  onEliminar: (resenaId: number) => Promise<void>;
}

/// Sección "tu reseña": formulario para crear (si el cliente no tiene una), tarjeta con
/// editar/eliminar (si ya tiene una y no está editando), o el mismo formulario precargado
/// (si está editando). Separado de DetalleProductoModal para no mezclar el estado del
/// formulario con el estado de carga de la lista completa.
function SeccionMiResena({ productoId, miResena, onCrear, onEditar, onEliminar }: SeccionMiResenaProps) {
  const [editando, setEditando] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  if (miResena && !editando) {
    return (
      <div className="rounded-xl border border-gold/40 bg-gold/5 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-navy">Tu reseña</p>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditando(true)} aria-label="Editar reseña">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-error-text hover:text-error-text"
              onClick={() => setConfirmandoEliminar(true)}
              aria-label="Eliminar reseña"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <Estrellas valor={miResena.calificacion} tamano="sm" />
        {miResena.comentario && <p className="mt-1.5 text-sm text-navy">{miResena.comentario}</p>}

        {confirmandoEliminar && (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-error-bg px-3 py-2">
            <p className="text-sm text-error-text">¿Eliminar tu reseña?</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={eliminando}
                onClick={() => setConfirmandoEliminar(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={eliminando}
                onClick={async () => {
                  setEliminando(true);
                  try {
                    await onEliminar(miResena.id);
                  } catch (err) {
                    toast.error(err instanceof ApiError ? err.message : 'No se pudo eliminar la reseña.');
                  } finally {
                    setEliminando(false);
                    setConfirmandoEliminar(false);
                  }
                }}
              >
                {eliminando ? <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" /> : 'Eliminar'}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <FormularioResena
      key={productoId}
      valoresIniciales={editando && miResena ? miResena : null}
      onCancelar={editando ? () => setEditando(false) : undefined}
      onEnviar={async (calificacion, comentario) => {
        if (editando && miResena) {
          await onEditar(miResena.id, calificacion, comentario);
          setEditando(false);
        } else {
          await onCrear(calificacion, comentario);
        }
      }}
    />
  );
}

interface FormularioResenaProps {
  valoresIniciales: Resena | null;
  onCancelar?: () => void;
  onEnviar: (calificacion: number, comentario: string) => Promise<void>;
}

function FormularioResena({ valoresIniciales, onCancelar, onEnviar }: FormularioResenaProps) {
  const [calificacion, setCalificacion] = useState(valoresIniciales?.calificacion ?? 0);
  const [comentario, setComentario] = useState(valoresIniciales?.comentario ?? '');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit() {
    if (calificacion === 0) {
      toast.error('Elige una calificación de 1 a 5 estrellas.');
      return;
    }
    setEnviando(true);
    try {
      await onEnviar(calificacion, comentario.trim());
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudo guardar la reseña.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm font-medium text-navy">
        {valoresIniciales ? 'Edita tu reseña' : 'Deja tu reseña'}
      </p>
      <div className="mt-2">
        <Estrellas valor={calificacion} tamano="lg" onChange={setCalificacion} />
      </div>
      <Textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="¿Qué te pareció el producto? (opcional)"
        maxLength={1000}
        className="mt-3"
        rows={3}
      />
      <div className="mt-3 flex justify-end gap-2">
        {onCancelar && (
          <Button variant="outline" size="sm" disabled={enviando} onClick={onCancelar}>
            Cancelar
          </Button>
        )}
        <Button variant="gold" size="sm" disabled={enviando} onClick={handleSubmit}>
          {enviando ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
          ) : valoresIniciales ? (
            'Guardar cambios'
          ) : (
            'Publicar reseña'
          )}
        </Button>
      </div>
    </div>
  );
}
