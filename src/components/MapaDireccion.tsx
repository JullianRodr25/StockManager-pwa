import { useEffect, useRef, useState } from 'react';
// Import solo de tipos: no genera código en el bundle. El valor real (la librería, ~1.9 MB) se
// carga perezosamente dentro del componente (ver el primer useEffect) para que páginas que
// nunca muestran un mapa (Catálogo, Mis pedidos...) no paguen ese peso en su carga inicial, y
// para no romper el límite de precacheo del service worker (2 MiB por archivo).
import type mapboxgl from 'mapbox-gl';
import { Loader2, LocateFixed, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { buscarDirecciones, CENTRO_POR_DEFECTO, geocodificarInverso, MAPBOX_TOKEN } from '@/lib/mapbox';
import type { SugerenciaDireccion } from '@/lib/mapbox';
import { Input } from '@/components/ui/input';

export interface UbicacionDireccion {
  direccion: string;
  lat: number | null;
  lng: number | null;
}

interface MapaDireccionProps {
  direccion: string;
  lat: number | null;
  lng: number | null;
  onCambiar: (valores: UbicacionDireccion) => void;
}

/**
 * Selector de dirección estilo Rappi: campo de búsqueda con autocompletado (Mapbox Geocoding)
 * + mapa con un pin arrastrable. Reemplaza el campo de texto libre de Checkout/Registro.
 *
 * Es un componente controlado "a medias" a propósito: el texto y las coordenadas viven en el
 * padre (onCambiar/direccion/lat/lng), pero el mapa y el marcador se inicializan una sola vez
 * y después se mueven imperativamente (centrarEn) en vez de recrearse en cada render — crear
 * un mapboxgl.Map de nuevo en cada tecla sería carísimo y perdería cualquier interacción en
 * curso del usuario (zoom, arrastre).
 */
export function MapaDireccion({ direccion, lat, lng, onCambiar }: MapaDireccionProps) {
  const [mapboxglLib, setMapboxglLib] = useState<typeof mapboxgl | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Los manejadores del mapa (dragend/click) se registran una sola vez al montar, así que
  // cierran sobre los valores de ESE render. Estas refs se mantienen al día en cada render
  // para que esos manejadores, aunque "viejos", siempre lean el último direccion/onCambiar.
  const direccionRef = useRef(direccion);
  const onCambiarRef = useRef(onCambiar);
  useEffect(() => {
    direccionRef.current = direccion;
    onCambiarRef.current = onCambiar;
  });

  const [query, setQuery] = useState(direccion);
  const [sugerencias, setSugerencias] = useState<SugerenciaDireccion[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [localizando, setLocalizando] = useState(false);

  function centrarEn(nuevoLat: number, nuevoLng: number) {
    markerRef.current?.setLngLat([nuevoLng, nuevoLat]);
    mapRef.current?.flyTo({ center: [nuevoLng, nuevoLat], zoom: 16 });
  }

  async function moverPinYActualizar(nuevoLat: number, nuevoLng: number) {
    const direccionEncontrada = await geocodificarInverso(nuevoLat, nuevoLng);
    const nuevaDireccion = direccionEncontrada ?? direccionRef.current;
    setQuery(nuevaDireccion);
    onCambiarRef.current({ direccion: nuevaDireccion, lat: nuevoLat, lng: nuevoLng });
  }

  // Carga mapbox-gl (y su CSS) de forma perezosa, solo cuando este componente realmente se
  // monta — ver el comentario del import de tipos arriba.
  useEffect(() => {
    if (!MAPBOX_TOKEN) return;
    let cancelado = false;

    Promise.all([import('mapbox-gl'), import('mapbox-gl/dist/mapbox-gl.css')]).then(([mod]) => {
      if (!cancelado) setMapboxglLib(() => mod.default);
    });

    return () => {
      cancelado = true;
    };
  }, []);

  // Inicializa el mapa y el marcador una sola vez, apenas mapbox-gl termina de cargar.
  useEffect(() => {
    if (!mapboxglLib || !mapContainerRef.current || mapRef.current) return;

    mapboxglLib.accessToken = MAPBOX_TOKEN;
    const centroInicial: [number, number] = lat != null && lng != null ? [lng, lat] : CENTRO_POR_DEFECTO;

    const map = new mapboxglLib.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: centroInicial,
      zoom: lat != null && lng != null ? 16 : 12,
    });
    map.addControl(new mapboxglLib.NavigationControl({ showCompass: false }), 'top-right');

    const marker = new mapboxglLib.Marker({ draggable: true, color: '#C9A227' })
      .setLngLat(centroInicial)
      .addTo(map);

    marker.on('dragend', () => {
      const { lat: nuevoLat, lng: nuevoLng } = marker.getLngLat();
      void moverPinYActualizar(nuevoLat, nuevoLng);
    });

    // Tocar/hacer clic en cualquier punto del mapa también mueve el pin ahí — no solo
    // arrastrándolo, más fácil de descubrir en móvil.
    map.on('click', (e) => {
      marker.setLngLat(e.lngLat);
      void moverPinYActualizar(e.lngLat.lat, e.lngLat.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Se re-evalúa cuando mapboxgl termina de cargar, pero el guard `mapRef.current` de arriba
    // asegura que el mapa solo se cree una vez; moverse después pasa por centrarEn(), no por
    // recrear el mapa — ver el comentario del componente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapboxglLib]);

  // Autocompletado con debounce mientras el usuario escribe.
  useEffect(() => {
    if (!query.trim() || query === direccion) {
      setSugerencias([]);
      return;
    }

    const proximidad: [number, number] | undefined = lat != null && lng != null ? [lng, lat] : undefined;
    const idTimeout = setTimeout(async () => {
      setBuscando(true);
      try {
        const resultados = await buscarDirecciones(query, proximidad);
        setSugerencias(resultados);
        setMostrarSugerencias(true);
      } finally {
        setBuscando(false);
      }
    }, 400);

    return () => clearTimeout(idTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function handleInputChange(valor: string) {
    setQuery(valor);
    // Mientras se escribe a mano sin elegir todavía una sugerencia, se limpia el pin — evita
    // quedarse con coordenadas de una dirección vieja mientras el texto ya dice otra cosa.
    onCambiar({ direccion: valor, lat: null, lng: null });
  }

  function seleccionarSugerencia(sugerencia: SugerenciaDireccion) {
    setQuery(sugerencia.texto);
    setSugerencias([]);
    setMostrarSugerencias(false);
    centrarEn(sugerencia.lat, sugerencia.lng);
    onCambiar({ direccion: sugerencia.texto, lat: sugerencia.lat, lng: sugerencia.lng });
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no admite geolocalización.');
      return;
    }

    setLocalizando(true);
    navigator.geolocation.getCurrentPosition(
      async (posicion) => {
        const { latitude, longitude } = posicion.coords;
        centrarEn(latitude, longitude);
        await moverPinYActualizar(latitude, longitude);
        setLocalizando(false);
      },
      () => {
        toast.error('No se pudo obtener tu ubicación. Revisa los permisos del navegador.');
        setLocalizando(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Si todavía no hay token (ej. build local sin .env configurado), se degrada a un campo de
  // texto simple en vez de romper el formulario entero.
  if (!MAPBOX_TOKEN) {
    return (
      <Input
        value={direccion}
        onChange={(e) => onCambiar({ direccion: e.target.value, lat: null, lng: null })}
        placeholder="Calle, número, barrio..."
        required
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => sugerencias.length > 0 && setMostrarSugerencias(true)}
          onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
          placeholder="Busca tu dirección..."
          autoComplete="off"
          required
        />
        {buscando && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-muted motion-reduce:animate-none" />
        )}

        {mostrarSugerencias && sugerencias.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
            {sugerencias.map((sugerencia) => (
              <button
                key={sugerencia.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => seleccionarSugerencia(sugerencia)}
                className="flex w-full items-start gap-2 px-3.5 py-2.5 text-left text-sm text-navy hover:bg-accent"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                {sugerencia.texto}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={mapContainerRef} className="h-48 w-full overflow-hidden rounded-xl border border-border" />

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={usarMiUbicacion}
          disabled={localizando}
          className="flex items-center gap-1.5 text-xs font-medium text-gold hover:underline disabled:opacity-60"
        >
          {localizando ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
          ) : (
            <LocateFixed className="h-3.5 w-3.5" />
          )}
          Usar mi ubicación actual
        </button>
        <p className="text-right text-xs text-text-muted">Arrastra el pin para ajustar el punto exacto</p>
      </div>
    </div>
  );
}
