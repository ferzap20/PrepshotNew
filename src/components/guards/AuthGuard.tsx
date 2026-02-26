import { Navigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { PrepShotLogo } from '@/components/brand/PrepShotLogo';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <PrepShotLogo size="lg" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
