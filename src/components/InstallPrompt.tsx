import { Download, Share, X } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { Button } from '@/components/ui/button';

/**
 * Banner de instalación de la app. Se muestra solo, sin que el usuario tenga que buscarlo,
 * apenas se detecta que la PWA no está instalada (ver useInstallPrompt para cuándo
 * exactamente). En Chrome/Edge/Android ofrece un botón "Instalar" que dispara el diálogo
 * nativo del navegador; en iOS Safari (que no soporta ese diálogo) muestra en su lugar el
 * paso manual que hay que seguir.
 */
export function InstallPrompt() {
  const { puedeOfrecerInstalacion, esIOS, instalar, descartar } = useInstallPrompt();

  if (!puedeOfrecerInstalacion) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 sm:bottom-4"
    >
      <div className="flex w-full max-w-md items-start gap-3 rounded-lg border border-border bg-background p-4 shadow-lg">
        <img src="/pwa-192.png" alt="" className="h-10 w-10 shrink-0 rounded-md" />

        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold text-navy">Instala Ferretería Gold</p>
          {esIOS && !instalar ? (
            <p className="mt-0.5 text-sm text-text-muted">
              Toca <Share className="mx-0.5 inline h-3.5 w-3.5 align-text-bottom" /> Compartir y luego
              &quot;Agregar a inicio&quot; para instalarla en tu pantalla.
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-text-muted">
              Accede más rápido y desde tu pantalla de inicio, como una app normal.
            </p>
          )}

          {instalar && (
            <Button type="button" variant="gold" size="sm" className="mt-3" onClick={instalar}>
              <Download className="h-4 w-4" />
              Instalar
            </Button>
          )}
        </div>

        <button
          type="button"
          onClick={descartar}
          aria-label="Cerrar"
          className="shrink-0 rounded-md p-1 text-text-muted hover:bg-accent hover:text-accent-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
