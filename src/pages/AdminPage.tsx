import { useState, useEffect } from 'react';
import { Shield, Users, Package, ChevronUp, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usersRepo, catalogItemsRepo } from '@/lib/db/repositories';
import { useAuth } from '@/hooks/useAuth';
import { UserRole, CatalogCategory } from '@/types/enums';
import { formatDateCustom } from '@/lib/utils/date';
import { useAppSetting } from '@/hooks/useAppSetting';
import type { User, CatalogItem } from '@/types/models';
import { DebugFileBadge } from '@/components/debug/DebugFileBadge';

export function AdminPage() {
  const { session } = useAuth();
  const dateFormat = useAppSetting('date_format', 'DD/MM/YYYY');

  const [users, setUsers] = useState<User[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    const [u, c] = await Promise.all([usersRepo.getAll(), catalogItemsRepo.getAll()]);
    u.sort((a, b) => a.email.localeCompare(b.email));
    setUsers(u);
    setCatalog(c);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleToggleRole = async (user: User) => {
    if (user.id === session?.userId) return;
    setTogglingId(user.id);
    const newRole = user.role === UserRole.Admin ? UserRole.User : UserRole.Admin;
    await usersRepo.update(user.id, { role: newRole });
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
    setTogglingId(null);
  };

  const catalogByCategory = Object.values(CatalogCategory).map((cat) => ({
    category: cat,
    count: catalog.filter((c) => c.category === cat).length,
  })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-36 bg-secondary rounded animate-pulse" />
        <div className="h-48 rounded-xl bg-secondary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield size={20} className="text-primary" />
        <h1>Admin Panel</h1>
        <DebugFileBadge />
      </div>

      {/* User Management */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-primary" />
          <h3>User Management</h3>
          <span className="ml-auto text-sm text-muted-foreground">{users.length} user{users.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="space-y-2">
          {users.map((user) => {
            const isSelf = user.id === session?.userId;
            const isAdmin = user.role === UserRole.Admin;
            return (
              <div
                key={user.id}
                className="flex items-center gap-3 py-2 px-3 rounded-lg bg-secondary/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.email}
                    {isSelf && <span className="text-xs text-muted-foreground ml-2">(you)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined {formatDateCustom(user.createdAt.slice(0, 10), dateFormat)}
                  </p>
                </div>
                <Badge variant={isAdmin ? 'info' : 'default'}>
                  {user.role}
                </Badge>
                {!isSelf && (
                  <button
                    onClick={() => handleToggleRole(user)}
                    disabled={togglingId === user.id}
                    title={isAdmin ? 'Demote to user' : 'Promote to admin'}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    {isAdmin ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Catalog Stats */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Package size={16} className="text-primary" />
          <h3>Catalog Stats</h3>
          <span className="ml-auto text-sm text-muted-foreground">{catalog.length} total items</span>
        </div>
        {catalogByCategory.length === 0 ? (
          <p className="text-sm text-muted-foreground">No catalog items yet.</p>
        ) : (
          <div className="space-y-2">
            {catalogByCategory.map(({ category, count }) => (
              <div key={category} className="flex items-center gap-3">
                <span className="text-sm flex-1">{category}</span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-1.5 rounded-full bg-primary/30"
                    style={{ width: `${Math.round((count / catalog.length) * 120)}px` }}
                  />
                  <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
