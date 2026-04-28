/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '@/lib/api/client';
import type { UserRole } from '@/types/enums';

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
  name?: string;
}

interface ServerUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

function toSession(u: ServerUser): AuthSession {
  return { userId: u.id, email: u.email, role: u.role, name: u.name };
}

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<ServerUser>('/auth/me')
      .then((user) => setSession(toSession(user)))
      .catch(() => setSession(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const user = await api.post<ServerUser>('/auth/login', { email, password });
    setSession(toSession(user));
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const user = await api.post<ServerUser>('/auth/register', { email, password });
    setSession(toSession(user));
  }, []);

  const logout = useCallback(() => {
    api.post('/auth/logout').catch(() => {});
    setSession(null);
  }, []);

  const refreshSession = useCallback(async () => {
    const user = await api.get<ServerUser>('/auth/me');
    setSession(toSession(user));
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading, login, register, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}
