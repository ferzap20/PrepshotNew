/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, ApiError } from '@/lib/api/client';
import { useAuth } from '@/hooks/useAuth';

type SettingsMap = Record<string, string>;

interface AppSettingsContextValue {
  settings: SettingsMap;
  isLoaded: boolean;
  setSetting: (key: string, value: string) => Promise<void>;
}

export const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [settings, setSettings] = useState<SettingsMap>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!session) {
      setSettings({});
      setIsLoaded(true);
      return;
    }

    api.get<SettingsMap>('/settings')
      .then((map) => setSettings(map))
      .catch((err) => {
        if (!(err instanceof ApiError && err.status === 401)) throw err;
        setSettings({});
      })
      .finally(() => setIsLoaded(true));
  }, [session]);

  const setSetting = useCallback(async (key: string, value: string) => {
    await api.put(`/settings/${key}`, { value });
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <AppSettingsContext.Provider value={{ settings, isLoaded, setSetting }}>
      {children}
    </AppSettingsContext.Provider>
  );
}
