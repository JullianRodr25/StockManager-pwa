// Helpers para el selector de dirección estilo Rappi (ver components/MapaDireccion.tsx).
// Usa directamente la API REST de Geocoding de Mapbox (v5) en vez de una librería adicional
// (ej. @mapbox/search-js): es un par de endpoints HTTP simples, así que un fetch + un tipo de
// respuesta propio alcanza y evita sumar peso al bundle para algo tan puntual.

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? '';

// Colombia, aproximadamente — el país donde opera la ferretería. Limita el autocompletado a
// resultados locales (evita que "Calle 10" traiga sugerencias de México o España) y sirve de
// centro inicial del mapa cuando todavía no hay ninguna ubicación elegida.
const PAIS = 'co';
const CENTRO_POR_DEFECTO: [number, number] = [-74.0721, 4.711]; // Bogotá

export interface SugerenciaDireccion {
  id: string;
  texto: string;
  lat: number;
  lng: number;
}

function construirUrlBusqueda(query: string, proximidad?: [number, number]): string {
  const params = new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    country: PAIS,
    language: 'es',
    limit: '5',
    types: 'address,poi,place',
  });
  if (proximidad) {
    params.set('proximity', `${proximidad[0]},${proximidad[1]}`);
  }
  return `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`;
}

/**
 * Autocompletado de direcciones a partir de texto libre (lo que el cliente va escribiendo).
 * proximidad (opcional) prioriza resultados cercanos a esas coordenadas — útil una vez que ya
 * hay un pin en el mapa, para que "escribir para corregir" siga sugiriendo cerca de ahí.
 */
export async function buscarDirecciones(
  query: string,
  proximidad?: [number, number]
): Promise<SugerenciaDireccion[]> {
  if (!query.trim() || !MAPBOX_TOKEN) return [];

  const respuesta = await fetch(construirUrlBusqueda(query, proximidad));
  if (!respuesta.ok) return [];

  const datos = await respuesta.json();
  const features: Array<{ id: string; place_name: string; center: [number, number] }> = datos.features ?? [];

  return features.map((f) => ({
    id: f.id,
    texto: f.place_name,
    lng: f.center[0],
    lat: f.center[1],
  }));
}

/**
 * Geocoding inverso: a partir de un punto del mapa (ej. el pin arrastrado a mano), devuelve la
 * dirección legible más cercana. Devuelve null si Mapbox no encuentra nada en ese punto (agua,
 * zona sin direcciones catastradas, etc.) — el llamador decide qué mostrar en ese caso.
 */
export async function geocodificarInverso(lat: number, lng: number): Promise<string | null> {
  if (!MAPBOX_TOKEN) return null;

  const params = new URLSearchParams({ access_token: MAPBOX_TOKEN, language: 'es', types: 'address,poi,place' });
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?${params.toString()}`;

  const respuesta = await fetch(url);
  if (!respuesta.ok) return null;

  const datos = await respuesta.json();
  const primerResultado = datos.features?.[0];
  return primerResultado?.place_name ?? null;
}

export { CENTRO_POR_DEFECTO };
