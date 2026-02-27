import { useContext } from 'react';
import { AppSettingsContext } from '@/contexts/AppSettingsContext';

/** Returns the value of a single app setting, falling back to `defaultValue`. */
export function useAppSetting(key: string, defaultValue: string): string {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) return defaultValue;
  return ctx.settings[key] ?? defaultValue;
}
