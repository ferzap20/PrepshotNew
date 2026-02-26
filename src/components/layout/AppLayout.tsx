import { Outlet } from 'react-router';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { PWANotifications } from '@/components/pwa/PWANotifications';

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar />
        <main className="lg:pl-60 pt-16">
          <div className="max-w-[1400px] mx-auto p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
        <PWANotifications />
      </div>
    </SidebarProvider>
  );
}
