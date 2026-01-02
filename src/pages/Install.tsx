import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check, Smartphone, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const Install: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-6">
          <Check className="h-10 w-10 text-success" />
        </div>
        <h1 className="text-2xl font-bold mb-2">¡Ya está instalada!</h1>
        <p className="text-muted-foreground mb-6">
          La app Propósitos 2026 ya está en tu pantalla de inicio.
        </p>
        <Button onClick={() => window.location.href = '/'}>
          Ir a la app
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg">
        <span className="text-4xl">🎯</span>
      </div>
      
      <h1 className="text-2xl font-bold mb-2">Propósitos 2026</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Instala la app en tu pantalla de inicio para acceso rápido a tus metas.
      </p>

      {isIOS ? (
        <div className="space-y-6 max-w-sm">
          <div className="card-elevated p-4 text-left space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Cómo instalar en iPhone/iPad
            </h3>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold flex-shrink-0">1</span>
                <span>Toca el botón <Share className="inline h-4 w-4" /> Compartir en Safari</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold flex-shrink-0">2</span>
                <span>Desplázate y selecciona <Plus className="inline h-4 w-4" /> "Añadir a pantalla de inicio"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold flex-shrink-0">3</span>
                <span>Toca "Añadir" para confirmar</span>
              </li>
            </ol>
          </div>
        </div>
      ) : deferredPrompt ? (
        <Button size="lg" onClick={handleInstall} className="gap-2">
          <Download className="h-5 w-5" />
          Instalar App
        </Button>
      ) : (
        <div className="space-y-6 max-w-sm">
          <div className="card-elevated p-4 text-left space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Cómo instalar
            </h3>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold flex-shrink-0">1</span>
                <span>Abre el menú de tu navegador (⋮ o ⋯)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold flex-shrink-0">2</span>
                <span>Selecciona "Instalar app" o "Añadir a pantalla de inicio"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold flex-shrink-0">3</span>
                <span>Confirma la instalación</span>
              </li>
            </ol>
          </div>
        </div>
      )}

      <Button 
        variant="ghost" 
        className="mt-6"
        onClick={() => window.location.href = '/'}
      >
        Continuar en el navegador
      </Button>
    </div>
  );
};

export default Install;
