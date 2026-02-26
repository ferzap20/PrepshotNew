import { Menu, LogOut, Wifi, WifiOff } from 'lucide-react';
import { PrepShotLogo } from '@/components/brand/PrepShotLogo';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/hooks/useSidebar';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useNavigate } from 'react-router';

export function Header() {
  const { session, logout } = useAuth();
  const { toggle } = useSidebar();
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          >
            <Menu size={20} />
          </button>
          <PrepShotLogo size="sm" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isOnline ? (
              <Wifi size={14} className="text-emerald-500" />
            ) : (
              <WifiOff size={14} className="text-destructive" />
            )}
            <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {session && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {session.email}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
