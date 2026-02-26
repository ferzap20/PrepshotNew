import { useState, useEffect } from 'react';
import { Download, X, Wifi } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function PWANotifications() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
  } = useRegisterSW();

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  const showOffline = offlineReady;
  const showInstall = !!deferredPrompt && !installed;

  if (!showOffline && !showInstall) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center w-full max-w-sm px-4">
      {showOffline && (
        <div className="flex items-center gap-3 w-full bg-card border border-border rounded-xl px-4 py-3 shadow-lg text-sm">
          <Wifi size={16} className="text-emerald-500 flex-shrink-0" />
          <span className="flex-1">App ready for offline use</span>
          <button
            onClick={() => setOfflineReady(false)}
            className="p-1 rounded hover:bg-secondary text-muted-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {showInstall && (
        <div className="flex items-center gap-3 w-full bg-card border border-border rounded-xl px-4 py-3 shadow-lg text-sm">
          <Download size={16} className="text-primary flex-shrink-0" />
          <span className="flex-1">Install PrepShot app</span>
          <button
            onClick={handleInstall}
            className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            Install
          </button>
          <button
            onClick={() => setDeferredPrompt(null)}
            className="p-1 rounded hover:bg-secondary text-muted-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
