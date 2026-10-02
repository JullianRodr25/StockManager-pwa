import { useRef, useState } from 'react';
import { Package } from 'lucide-react';
import type { ProductoFotoCatalogo } from '@/types/catalogo';

interface CarruselFotosProductoProps {
  fotos: ProductoFotoCatalogo[];
  nombre: string;
}

/// Carrusel estilo Homecenter para la tarjeta de un producto en el catálogo: swipeable con
/// scroll-snap nativo (sin librería extra) y puntos indicadores. Si el producto no tiene
/// fotos, muestra el placeholder de siempre; si tiene solo una, la muestra fija sin puntos.
export function CarruselFotosProducto({ fotos, nombre }: CarruselFotosProductoProps) {
  const [indiceActivo, setIndiceActivo] = useState(0);
  const contenedorRef = useRef<HTMLDivElement>(null);

  if (fotos.length === 0) {
    return (
      <div className="flex h-32 w-full shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
        <Package className="h-8 w-8" />
      </div>
    );
  }

  function handleScroll() {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;
    const indice = Math.round(contenedor.scrollLeft / contenedor.clientWidth);
    setIndiceActivo(Math.min(indice, fotos.length - 1));
  }

  return (
    <div className="relative">
      <div
        ref={contenedorRef}
        onScroll={handleScroll}
        className="flex h-32 w-full snap-x snap-mandatory overflow-x-auto rounded-xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {fotos.map((foto) => (
          <img
            key={foto.id}
            src={foto.url}
            alt={nombre}
            className="h-32 w-full shrink-0 snap-center snap-always object-cover"
          />
        ))}
      </div>

      {fotos.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-1.5 flex justify-center gap-1">
          {fotos.map((foto, indice) => (
            <span
              key={foto.id}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                indice === indiceActivo ? 'bg-gold' : 'bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
