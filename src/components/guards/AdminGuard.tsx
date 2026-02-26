import { Navigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/enums';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();

  if (session?.role !== UserRole.Admin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
