/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '@/lib/api/client';
import type { UserRole } from '@/types/enums';

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
}

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
    // Check for existing session via the JWT cookie on the server
    api.get<AuthSession>('/auth/me')
      .then((user) => setSession(user))
      .catch(() => setSession(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const user = await api.post<AuthSession>('/auth/login', { email, password });
    setSession(user);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const user = await api.post<AuthSession>('/auth/register', { email, password });
    setSession(user);
  }, []);

  const logout = useCallback(() => {
    api.post('/auth/logout').catch(() => {});
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
