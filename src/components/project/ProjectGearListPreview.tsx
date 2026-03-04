import { useState, useMemo } from 'react';
import type { ProjectGeneralListItem, CatalogItem, User } from '@/types/models';

interface Props {
  items: ProjectGeneralListItem[];
  catalogItems: CatalogItem[];
  users: User[];
}

function getUserLabel(user: User | undefined, email?: string): string {
  if (user?.name) return `${user.name}'s List`;
  const prefix = (user?.email ?? email ?? 'Unknown').split('@')[0];
  return `${prefix}'s List`;
}

export function ProjectGearListPreview({ items, catalogItems, users }: Props) {
  const catalogMap = useMemo(
    () => new Map(catalogItems.map((c) => [c.id, c])),
    [catalogItems],
  );

  const userGroups = useMemo(() => {
    const map = new Map<string, ProjectGeneralListItem[]>();
    for (const item of items) {
      const existing = map.get(item.userId) ?? [];
      existing.push(item);
      map.set(item.userId, existing);
    }
    return Array.from(map.entries()).map(([userId, groupItems]) => ({
      userId,
      user: users.find((u) => u.id === userId),
      items: groupItems,
    }));
  }, [items, users]);

  const [activeUserId, setActiveUserId] = useState<string | null>(
    () => userGroups[0]?.userId ?? null,
  );

  if (items.length === 0) {
    return (
      <p className="text-sm italic text-muted-foreground">No items in this list yet.</p>
    );
  }

  const activeGroup =
    userGroups.find((g) => g.userId === activeUserId) ?? userGroups[0];

  const categoryGroups = useMemo(() => {
    const map = new Map<string, { cat: CatalogItem; item: ProjectGeneralListItem }[]>();
    for (const item of activeGroup.items) {
      const cat = catalogMap.get(item.catalogItemId);
      if (!cat) continue;
      const label = cat.category as string;
      const existing = map.get(label) ?? [];
      existing.push({ cat, item });
      map.set(label, existing);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, rows]) => ({ category, rows }));
  }, [activeGroup, catalogMap]);

  return (
    <div className="space-y-4">
      {userGroups.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {userGroups.map((g) => (
            <button
              key={g.userId}
              onClick={() => setActiveUserId(g.userId)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                g.userId === activeGroup.userId
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {getUserLabel(g.user)}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {categoryGroups.map(({ category, rows }) => (
          <div key={category}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {category}
              </span>
              <span className="text-xs text-muted-foreground/50">{rows.length}</span>
              <div className="flex-1 border-t border-border" />
            </div>
            <div className="flex flex-col gap-1">
              {rows.map(({ cat, item }) => (
                <div
                  key={item.id}
                  className="flex items-baseline justify-between gap-4 py-1 text-sm"
                >
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="font-medium truncate">{cat.name}</span>
                    {cat.brand && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">{cat.brand}</span>
                    )}
                    {item.notes && (
                      <span className="text-xs text-muted-foreground/60 truncate italic">{item.notes}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">×{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
