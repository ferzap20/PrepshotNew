import { useState, useMemo } from 'react';
import { MessageCircle } from 'lucide-react';
import { ListItemCommentModal } from './ListItemCommentModal';
import type { ProjectGeneralListItem, CatalogItem, User, ProjectMember, Project } from '@/types/models';

interface Props {
  projectId?: string;
  items: ProjectGeneralListItem[];
  catalogItems: CatalogItem[];
  users: User[];
  members?: ProjectMember[];
  project?: Project | null;
  printMode?: boolean;
  showBrand?: boolean;
  showQuantity?: boolean;
  onCreateList?: () => void;
}

function getTabLabel(
  userId: string,
  user: User | undefined,
  members: ProjectMember[],
  project: Project | null | undefined,
): string {
  const name = user?.name || user?.email?.split('@')[0] || 'Unknown';
  const member = members.find((m) => m.userId === userId);
  const crewType = member?.crewType || project?.crewType;
  if (crewType) return `${name} · ${crewType}`;
  return `${name}'s List`;
}

export function ProjectGearListPreview({
  projectId,
  items,
  catalogItems,
  users,
  members = [],
  project,
  printMode = false,
  showBrand = true,
  showQuantity = true,
  onCreateList,
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

  const [commentItem, setCommentItem] = useState<{ id: string; name: string } | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <p className="text-sm italic text-muted-foreground">No items in this list yet.</p>
        {onCreateList && (
          <button
            onClick={onCreateList}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-prepshot-teal-dark transition-colors"
          >
            Create List
          </button>
        )}
      </div>
    );
  }

  const groupsToRender = printMode
    ? userGroups
    : [userGroups.find((g) => g.userId === activeUserId) ?? userGroups[0]];

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
    <>
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
                {getTabLabel(g.userId, g.user, members, project)}
              </button>
            ))}
          </div>
        )}

        {groupsToRender.map((group) => (
          <div key={group?.userId ?? 'default'}>
            {printMode && userGroups.length > 1 && group && (
              <h2 className="text-base font-semibold mb-3">
                {getTabLabel(group.userId, group.user, members, project)}
              </h2>
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
                        className="flex items-baseline justify-between gap-4 py-1 text-sm print-item group/row"
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
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {showQuantity && (
                            <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                          )}
                          {!printMode && projectId && (
                            <button
                              onClick={() => setCommentItem({ id: item.id, name: cat.name })}
                              className="opacity-0 group-hover/row:opacity-100 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                              aria-label="Comments"
                            >
                              <MessageCircle size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {commentItem && projectId && (
        <ListItemCommentModal
          projectId={projectId}
          itemId={commentItem.id}
          itemName={commentItem.name}
          allUsers={users}
          onClose={() => setCommentItem(null)}
        />
      )}
    </>
  );
}
