import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  FolderOpen,
  Package,
  Wrench,
  Building2,
  Settings,
  Shield,
  BookOpen,
  Palette,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/hooks/useSidebar';
import { UserRole } from '@/types/enums';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
}

const mainNav: NavItem[] = [
  { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/projects', icon: <FolderOpen size={18} />, label: 'Projects' },
  { to: '/templates', icon: <BookOpen size={18} />, label: 'Templates' },
  { to: '/catalog', icon: <Package size={18} />, label: 'Catalog' },
  { to: '/my-gear', icon: <Wrench size={18} />, label: 'My Gear' },
  { to: '/rental-sources', icon: <Building2 size={18} />, label: 'Rental Sources' },
];

const systemNav: NavItem[] = [
  { to: '/settings', icon: <Settings size={18} />, label: 'Settings' },
  { to: '/admin', icon: <Shield size={18} />, label: 'Admin', adminOnly: true },
];

const designNav: NavItem[] = [
  { to: '/design-elements', icon: <Palette size={18} />, label: 'Design Elements', adminOnly: true },
];

function SidebarLink({ to, icon, label }: NavItem) {
  const { close } = useSidebar();

  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={close}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-sidebar-foreground/70 hover:bg-muted hover:text-foreground',
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export function Sidebar() {
  const { session } = useAuth();
  const { isOpen, close } = useSidebar();
  const isAdmin = session?.role === UserRole.Admin;

  const filteredSystemNav = systemNav.filter((item) => !item.adminOnly || isAdmin);
  const filteredDesignNav = designNav.filter((item) => !item.adminOnly || isAdmin);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-16 bottom-0 left-0 z-50 w-60 bg-sidebar border-r border-sidebar-border overflow-y-auto transition-transform duration-200 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <nav className="p-3 space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-2">
              Main
            </p>
            {mainNav.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </div>

          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-2">
              System
            </p>
            {filteredSystemNav.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </div>

          {isAdmin && filteredDesignNav.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-2">
                Design
              </p>
              {filteredDesignNav.map((item) => (
                <SidebarLink key={item.to} {...item} />
              ))}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
