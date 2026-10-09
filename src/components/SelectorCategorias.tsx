import { useMemo, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import type { CategoriaCatalogo } from '@/types/catalogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

// Desde esta cantidad de categorías se muestra el buscador: con pocas no hace falta y estorba.
const UMBRAL_BUSCADOR = 8;

interface SelectorCategoriasProps {
  categorias: CategoriaCatalogo[];
  seleccionada: number | null;
  onSeleccionar: (categoriaId: number | null) => void;
}

/**
 * Filtro por categoría pensado para crecer: en vez de una fila horizontal de "chips" (donde las
 * categorías de más allá del borde de la pantalla quedan escondidas), un botón abre una lista
 * vertical con buscador y cantidad de productos. Funciona igual con 5 categorías que con 200,
 * y las nuevas aparecen solas en cuanto tienen productos activos.
 */
export function SelectorCategorias({ categorias, seleccionada, onSeleccionar }: SelectorCategoriasProps) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const categoriaActual = categorias.find((c) => c.id === seleccionada) ?? null;

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es');
    if (!texto) return categorias;
    return categorias.filter((c) => c.nombre.toLocaleLowerCase('es').includes(texto));
  }, [categorias, busqueda]);

  function cambiarAbierto(valor: boolean) {
    setAbierto(valor);
    if (!valor) setBusqueda('');
  }

  function elegir(categoriaId: number | null) {
    onSeleccionar(categoriaId);
    cambiarAbierto(false);
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-10 min-w-0 flex-1 justify-between gap-2 rounded-full px-4"
          onClick={() => setAbierto(true)}
          aria-haspopup="dialog"
        >
          <span className="truncate text-sm">
            <span className="text-text-muted">Categoría: </span>
            <span className="font-medium text-navy">{categoriaActual?.nombre ?? 'Todas'}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
        </Button>

        {categoriaActual && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full"
            onClick={() => onSeleccionar(null)}
            aria-label="Quitar filtro de categoría"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <Sheet open={abierto} onOpenChange={cambiarAbierto}>
        <SheetContent side="bottom" className="flex max-h-[85vh] flex-col gap-3 rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Categorías</SheetTitle>
            <SheetDescription>Elige una para ver solo esos productos.</SheetDescription>
          </SheetHeader>

          {categorias.length >= UMBRAL_BUSCADOR && (
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />
              <Input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar categoría"
                className="pl-9"
                aria-label="Buscar categoría"
              />
            </div>
          )}

          <ul className="-mx-2 flex-1 overflow-y-auto">
            {!busqueda.trim() && (
              <li>
                <OpcionCategoria
                  nombre="Todas las categorías"
                  activa={seleccionada === null}
                  onClick={() => elegir(null)}
                />
              </li>
            )}
            {filtradas.map((categoria) => (
              <li key={categoria.id}>
                <OpcionCategoria
                  nombre={categoria.nombre}
                  cantidad={categoria.cantidadProductos}
                  activa={seleccionada === categoria.id}
                  onClick={() => elegir(categoria.id)}
                />
              </li>
            ))}
            {filtradas.length === 0 && (
              <li className="px-2 py-6 text-center text-sm text-text-muted">No hay categorías con ese nombre.</li>
            )}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}

interface OpcionCategoriaProps {
  nombre: string;
  cantidad?: number;
  activa: boolean;
  onClick: () => void;
}

function OpcionCategoria({ nombre, cantidad, activa, onClick }: OpcionCategoriaProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={activa ? 'true' : undefined}
      className={cn(
        'flex min-h-12 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors',
        activa ? 'bg-gold/15 font-semibold text-navy' : 'text-navy hover:bg-muted'
      )}
    >
      <span className="truncate">{nombre}</span>
      <span className="flex shrink-0 items-center gap-2 text-text-muted">
        {cantidad !== undefined && <span className="text-xs">{cantidad}</span>}
        {activa && <Check className="h-4 w-4 text-gold" aria-hidden="true" />}
      </span>
    </button>
  );
}
