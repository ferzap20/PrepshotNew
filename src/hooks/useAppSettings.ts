import { useContext } from 'react';
import { AppSettingsContext } from '@/contexts/AppSettingsContext';

/** Returns the full settings map and a typed setter. */
export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used inside <AppSettingsProvider>');
  return ctx;
}
