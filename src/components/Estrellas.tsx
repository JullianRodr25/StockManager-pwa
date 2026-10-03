import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EstrellasProps {
  /// Calificación actual (1-5). Se redondea al entero más cercano para decidir cuántas
  /// estrellas se pintan llenas — no se intenta mostrar medias estrellas.
  valor: number;
  tamano?: 'sm' | 'md' | 'lg';
  /// Si se pasa, las estrellas se vuelven clickeables (selector interactivo del formulario de
  /// reseña). Si se omite, el componente es puramente de lectura (promedio del producto).
  onChange?: (valor: number) => void;
}

const TAMANOS = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-7 w-7' };

/// Estrellas de calificación (1-5), reutilizadas tanto para mostrar el promedio de un
/// producto (solo lectura) como para el selector del formulario de reseña (interactivo).
export function Estrellas({ valor, tamano = 'md', onChange }: EstrellasProps) {
  const redondeado = Math.round(valor);
  const claseIcono = TAMANOS[tamano];
  const interactivo = onChange != null;

  return (
    <div className="flex items-center gap-0.5" role={interactivo ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((estrella) => {
        const llena = estrella <= redondeado;
        const icono = (
          <Star
            className={cn(claseIcono, llena ? 'fill-gold text-gold' : 'fill-none text-border')}
          />
        );

        if (!interactivo) {
          return <span key={estrella}>{icono}</span>;
        }

        return (
          <button
            key={estrella}
            type="button"
            role="radio"
            aria-checked={estrella === redondeado}
            aria-label={`${estrella} de 5 estrellas`}
            onClick={() => onChange(estrella)}
            className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {icono}
          </button>
        );
      })}
    </div>
  );
}
