/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  getSession,
  type AuthSession,
} from '@/lib/auth/auth-service';
import { seed } from '@/lib/db/seed';

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await seed();
      const existing = getSession();
      setSession(existing);
      setIsLoading(false);
    }
    init();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const s = await authLogin(email, password);
    setSession(s);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    await authRegister(email, password);
    const s = await authLogin(email, password);
    setSession(s);
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
