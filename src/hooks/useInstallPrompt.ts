import { useEffect, useState } from 'react';

// Tipo del evento 'beforeinstallprompt': no forma parte del DOM estándar de TypeScript
// (solo lo implementan Chrome/Edge/Android), así que se declara acá en vez de instalar un
// paquete de tipos adicional solo para esto.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const CLAVE_DESCARTADO = 'fg-pwa-install-descartado';

function detectarEsIOS(): boolean {
  const ua = window.navigator.userAgent;
  const esIOS = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ se reporta como "Macintosh" pero tiene soporte táctil, a diferencia de un Mac real.
  const esIPadOSComoMac = ua.includes('Macintosh') && navigator.maxTouchPoints > 1;
  return esIOS || esIPadOSComoMac;
}

function detectarYaInstalada(): boolean {
  // display-mode: standalone cubre Chrome/Edge/Android; navigator.standalone (no estándar)
  // es la forma en que Safari/iOS expone lo mismo cuando la app se abrió desde el ícono
  // agregado a la pantalla de inicio.
  const enStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const enStandaloneIOS = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return enStandalone || enStandaloneIOS;
}

/**
 * Detecta si la app puede instalarse y expone cómo ofrecerlo:
 * - Chrome/Edge/Android: captura el evento nativo 'beforeinstallprompt' (que el navegador
 *   dispara automáticamente cuando el manifest + service worker cumplen los requisitos de
 *   instalabilidad) y permite dispararlo desde un botón propio en vez del mini-infobar del
 *   navegador, que es menos visible y no se puede personalizar.
 * - iOS Safari: no dispara ese evento (Apple no lo soporta), así que ahí solo se puede
 *   detectar que la app NO está instalada y mostrar instrucciones manuales
 *   ("Compartir > Agregar a inicio").
 *
 * En ambos casos, si el usuario cierra el aviso se deja de mostrar por el resto de esa
 * sesión del navegador (sessionStorage), pero vuelve a aparecer la próxima vez que abra la
 * app mientras siga sin instalarla — tal como se pidió: ofrecer instalar cada vez que se
 * detecte que no está instalada, sin ser tan insistente como para repetirlo en cada clic
 * dentro de la misma visita.
 */
export function useInstallPrompt() {
  const [eventoInstalacion, setEventoInstalacion] = useState<BeforeInstallPromptEvent | null>(null);
  const [yaInstalada, setYaInstalada] = useState(() => detectarYaInstalada());
  const [descartado, setDescartado] = useState(() => sessionStorage.getItem(CLAVE_DESCARTADO) === '1');

  useEffect(() => {
    if (yaInstalada) return;

    function alRecibirPrompt(evento: Event) {
      // Evita el mini-infobar automático del navegador: se controla la UI por completo
      // con el banner propio, consistente con el resto del diseño de la app.
      evento.preventDefault();
      setEventoInstalacion(evento as BeforeInstallPromptEvent);
    }

    function alInstalar() {
      setYaInstalada(true);
      setEventoInstalacion(null);
    }

    window.addEventListener('beforeinstallprompt', alRecibirPrompt);
    window.addEventListener('appinstalled', alInstalar);
    return () => {
      window.removeEventListener('beforeinstallprompt', alRecibirPrompt);
      window.removeEventListener('appinstalled', alInstalar);
    };
  }, [yaInstalada]);

  const esIOS = detectarEsIOS();
  // En iOS no hay evento que esperar: si no está instalada, el banner (con instrucciones
  // manuales) se puede mostrar de una vez.
  const puedeOfrecerInstalacion = !yaInstalada && !descartado && (eventoInstalacion !== null || esIOS);

  async function instalar() {
    if (!eventoInstalacion) return;
    await eventoInstalacion.prompt();
    const { outcome } = await eventoInstalacion.userChoice;
    if (outcome === 'accepted') {
      setYaInstalada(true);
    }
    // Un mismo evento 'beforeinstallprompt' solo se puede usar una vez.
    setEventoInstalacion(null);
  }

  function descartar() {
    sessionStorage.setItem(CLAVE_DESCARTADO, '1');
    setDescartado(true);
  }

  return {
    puedeOfrecerInstalacion,
    esIOS,
    instalar: eventoInstalacion ? instalar : null,
    descartar,
  };
}
