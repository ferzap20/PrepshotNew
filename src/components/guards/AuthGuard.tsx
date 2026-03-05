import { Navigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';


export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <img src="/prepshot logo main.png" alt="PrepShot" className="h-20 w-auto object-contain" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
