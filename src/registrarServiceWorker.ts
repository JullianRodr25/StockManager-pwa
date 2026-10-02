import { registerSW } from 'virtual:pwa-register';

// Cada cuánto se revisa si hay una versión nueva desplegada, mientras la app sigue abierta
// (sin que el usuario la cierre ni la reabra). El navegador ya revisa solo al abrir/navegar,
// pero si alguien deja la PWA abierta todo el día en segundo plano, sin esto no se enteraría
// de una actualización hasta la próxima vez que la reabra. Una hora es un buen punto medio:
// suficientemente seguido para que un cambio en producción llegue el mismo día, sin generar
// tráfico innecesario contra Vercel.
const INTERVALO_REVISION_MS = 60 * 60 * 1000;

/**
 * Registra el service worker y, con registerType: 'autoUpdate' (ver vite.config.ts), aplica
 * cualquier versión nueva sin preguntarle nada al usuario — simplemente la próxima vez que la
 * app se recargue (al reabrirla, o por la revisión periódica de abajo) ya queda en la última
 * versión.
 */
export function registrarServiceWorker(): void {
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      setInterval(() => {
        // Si el navegador no tiene red en este momento (sin conexión, modo avión), update()
        // falla en silencio y simplemente se reintenta en el próximo ciclo.
        registration.update().catch(() => {});
      }, INTERVALO_REVISION_MS);
    },
  });
}
