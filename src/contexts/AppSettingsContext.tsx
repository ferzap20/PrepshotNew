import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { appSettingsRepo } from '@/lib/db/repositories';

type SettingsMap = Record<string, string>;

interface AppSettingsContextValue {
  settings: SettingsMap;
  isLoaded: boolean;
  setSetting: (key: string, value: string) => Promise<void>;
}

export const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    appSettingsRepo.getAll().then((all) => {
      const map: SettingsMap = {};
      for (const s of all) map[s.key] = s.value;
      setSettings(map);
      setIsLoaded(true);
    });
  }, []);

  const setSetting = useCallback(async (key: string, value: string) => {
    await appSettingsRepo.set(key, value);
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <AppSettingsContext.Provider value={{ settings, isLoaded, setSetting }}>
      {children}
    </AppSettingsContext.Provider>
  );
}
