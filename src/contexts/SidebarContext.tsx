/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback, type ReactNode } from 'react';

interface SidebarContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <SidebarContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}
