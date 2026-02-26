import { useState, useEffect } from 'react';
import { appSettingsRepo } from '@/lib/db/repositories';

export function useAppSetting(key: string, defaultValue: string): string {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    appSettingsRepo.get(key).then((setting) => {
      if (setting) setValue(setting.value);
    });
  }, [key]);

  return value;
}
