import { useState, useMemo } from 'react';
import type { ProjectGeneralListItem, CatalogItem, User } from '@/types/models';

interface Props {
  items: ProjectGeneralListItem[];
  catalogItems: CatalogItem[];
  users: User[];
  printMode?: boolean;
  showBrand?: boolean;
  showQuantity?: boolean;
}

function getUserLabel(user: User | undefined): string {
  if (user?.name) return `${user.name}'s List`;
  const prefix = (user?.email ?? 'Unknown').split('@')[0];
  return `${prefix}'s List`;
}

export function ProjectGearListPreview({
  items,
  catalogItems,
  users,
  printMode = false,
  showBrand = true,
  showQuantity = true,
}: Props) {
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

  // In print mode, render all groups sequentially (no tabs)
  const groupsToRender = printMode ? userGroups : [userGroups.find((g) => g.userId === activeUserId) ?? userGroups[0]];

  function renderCategoryGroups(groupItems: ProjectGeneralListItem[]) {
    const map = new Map<string, { cat: CatalogItem; item: ProjectGeneralListItem }[]>();
    for (const item of groupItems) {
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
  }

  return (
    <div className="space-y-4">
      {/* Tabs — only in interactive mode */}
      {!printMode && userGroups.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {userGroups.map((g) => (
            <button
              key={g.userId}
              onClick={() => setActiveUserId(g.userId)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                g.userId === activeUserId
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {getUserLabel(g.user)}
            </button>
          ))}
        </div>
      )}

      {groupsToRender.map((group) => (
        <div key={group?.userId ?? 'default'}>
          {/* In print mode with multiple users, show a per-group heading */}
          {printMode && userGroups.length > 1 && group && (
            <h2 className="text-base font-semibold mb-3">{getUserLabel(group.user)}</h2>
          )}

          <div className="space-y-4">
            {renderCategoryGroups(group?.items ?? []).map(({ category, rows }) => (
              <div key={category} className="print-category">
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
                      className="flex items-baseline justify-between gap-4 py-1 text-sm print-item"
                    >
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className="font-medium truncate">{cat.name}</span>
                        {showBrand && cat.brand && (
                          <span className="text-xs text-muted-foreground flex-shrink-0">{cat.brand}</span>
                        )}
                        {item.notes && (
                          <span className="text-xs text-muted-foreground/60 truncate italic">{item.notes}</span>
                        )}
                      </div>
                      {showQuantity && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">×{item.quantity}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
