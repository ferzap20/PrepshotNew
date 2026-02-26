import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Trash2, Pencil, ChevronDown, ChevronRight, Search, Plus, Package, Check, Send, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { GearListEditModal } from '@/components/project-list/GearListEditModal';
import {
  projectsRepo,
  catalogItemsRepo,
  projectGeneralListsRepo,
  userGearRepo,
} from '@/lib/db/repositories';
import { useAuth } from '@/hooks/useAuth';
import { useAppSetting } from '@/hooks/useAppSetting';
import { cn } from '@/lib/utils/cn';
import { CatalogCategory } from '@/types/enums';
import type { CatalogItem, ProjectGeneralListItem, UserGearItem, Project } from '@/types/models';

function scoreMatch(query: string, item: CatalogItem): number {
  const q = query.toLowerCase().trim();
  if (!q) return 1;
  const text = [item.name, item.brand, ...(item.aliases ?? [])].join(' ').toLowerCase();
  if (item.name.toLowerCase().startsWith(q)) return 3;
  if (text.includes(q)) return 2;
  if (q.split(/\s+/).every((w) => text.includes(w))) return 1;
  return 0;
}

const CATEGORY_ORDER = Object.values(CatalogCategory);

export function ProjectListPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { session } = useAuth();
  const personalItemLabel = useAppSetting('personal_item_label', 'personal item');

  const [project, setProject] = useState<Project | null>(null);
  const [listItems, setListItems] = useState<ProjectGeneralListItem[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [userGear, setUserGear] = useState<UserGearItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const [mobileTab, setMobileTab] = useState<'list' | 'add'>('list');
  const [addTab, setAddTab] = useState<'catalog' | 'mygear'>('catalog');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [editingItem, setEditingItem] = useState<ProjectGeneralListItem | null>(null);

  const load = async () => {
    if (!projectId || !session) return;
    setIsLoading(true);
    const [proj, items, catalog, gear] = await Promise.all([
      projectsRepo.getById(projectId),
      projectGeneralListsRepo.getByProjectId(projectId),
      catalogItemsRepo.getAll(),
      userGearRepo.getByUserId(session.userId),
    ]);
    setProject(proj ?? null);
    setListItems(items);
    setCatalogItems(catalog);
    setUserGear(gear);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, [projectId, session?.userId]);

  const catalogMap = useMemo(() => new Map(catalogItems.map((c) => [c.id, c])), [catalogItems]);
  const addedCatalogIds = useMemo(() => new Set(listItems.map((i) => i.catalogItemId)), [listItems]);
  const addedUserGearIds = useMemo(
    () => new Set(listItems.filter((i) => i.userGearId).map((i) => i.userGearId!)),
    [listItems],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Array<{ item: ProjectGeneralListItem; cat: CatalogItem }>>();
    for (const item of listItems) {
      const cat = catalogMap.get(item.catalogItemId);
      if (!cat) continue;
      if (!map.has(cat.category)) map.set(cat.category, []);
      map.get(cat.category)!.push({ item, cat });
    }
    return CATEGORY_ORDER
      .filter((c) => map.has(c))
      .map((category) => ({
        category,
        rows: map.get(category)!.sort((a, b) => a.cat.name.localeCompare(b.cat.name)),
      }));
  }, [listItems, catalogMap]);

  const filteredCatalog = useMemo(() => {
    let items = catalogItems;
    if (categoryFilter) items = items.filter((c) => c.category === categoryFilter);
    if (search.trim()) {
      return items
        .map((c) => ({ c, score: scoreMatch(search, c) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ c }) => c);
    }
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [catalogItems, search, categoryFilter]);

  const filteredUserGear = useMemo(() => {
    if (!search.trim()) return userGear;
    return userGear.filter((g) => {
      const cat = catalogMap.get(g.catalogItemId);
      return cat ? scoreMatch(search, cat) > 0 : false;
    });
  }, [userGear, search, catalogMap]);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const isPublished = listItems.length > 0 && listItems.every((i) => i.published);

  const handleTogglePublish = async () => {
    const newVal = !isPublished;
    await Promise.all(
      listItems.map((item) => projectGeneralListsRepo.update(item.id, { published: newVal })),
    );
    await load();
  };

  const handleAddFromCatalog = async (catalogItem: CatalogItem) => {
    if (!projectId || !session || addedCatalogIds.has(catalogItem.id)) return;
    await projectGeneralListsRepo.create({
      projectId,
      userId: session.userId,
      catalogItemId: catalogItem.id,
      quantity: 1,
      notes: '',
      isRequired: false,
      published: false,
      source: null,
      userGearId: null,
    });
    await load();
  };

  const handleAddFromMyGear = async (gearItem: UserGearItem) => {
    if (!projectId || !session || addedUserGearIds.has(gearItem.id)) return;
    await projectGeneralListsRepo.create({
      projectId,
      userId: session.userId,
      catalogItemId: gearItem.catalogItemId,
      quantity: gearItem.quantity ?? 1,
      notes: '',
      isRequired: false,
      published: false,
      source: 'personal',
      userGearId: gearItem.id,
    });
    await load();
  };

  const handleExportCSV = () => {
    const header = ['Name', 'Brand', 'Category', 'Quantity', 'Required', 'Notes'];
    const rows = listItems.map((item) => {
      const cat = catalogMap.get(item.catalogItemId);
      return [
        cat?.name ?? '',
        cat?.brand ?? '',
        cat?.category ?? '',
        String(item.quantity),
        item.isRequired ? 'Yes' : 'No',
        item.notes,
      ];
    });
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((r) => r.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name ?? 'gear-list'}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (itemId: string) => {
    await projectGeneralListsRepo.remove(itemId);
    setListItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 bg-secondary rounded animate-pulse" />
        <div className="h-64 bg-secondary rounded-xl animate-pulse" />
      </div>
    );
  }

  const GearListPanel = (
    <div className="flex flex-col gap-2 h-full overflow-y-auto pr-0.5">
      {grouped.length === 0 ? (
        <EmptyState
          icon={<Package size={32} />}
          title="No gear added yet"
          description="Browse the catalog or your gear on the right to add items."
        />
      ) : (
        grouped.map(({ category, rows }) => {
          const collapsed = collapsedCategories.has(category);
          return (
            <div key={category}>
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center gap-2 w-full text-left py-1.5 px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                {category}
                <span className="ml-auto font-normal normal-case tracking-normal">{rows.length}</span>
              </button>
              {!collapsed && (
                <div className="flex flex-col gap-1.5 mb-2">
                  {rows.map(({ item, cat }) => (
                    <Card key={item.id} className="flex items-center gap-3 py-2.5 px-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium truncate">{cat.name}</span>
                          {item.source === 'personal' && (
                            <Badge variant="info">{personalItemLabel}</Badge>
                          )}
                          {item.isRequired && <Badge variant="default">Required</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                          {item.notes && (
                            <span className="text-xs text-muted-foreground truncate">{item.notes}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  const AddGearPanel = (
    <div className="flex flex-col h-full gap-3">
      <div className="relative flex-shrink-0">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items…"
          className="w-full pl-9 pr-3 py-2 text-sm bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
      </div>

      <div className="flex gap-1 flex-shrink-0">
        {(['catalog', 'mygear'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setAddTab(tab)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-colors',
              addTab === tab ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
            )}
          >
            {tab === 'catalog' ? 'Catalog' : 'My Gear'}
          </button>
        ))}
      </div>

      {addTab === 'catalog' && (
        <>
          <div className="flex gap-1.5 flex-wrap flex-shrink-0">
            <button
              onClick={() => setCategoryFilter('')}
              className={cn('px-2.5 py-1 rounded-full text-xs transition-colors', !categoryFilter ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground')}
            >
              All
            </button>
            {CATEGORY_ORDER.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat === categoryFilter ? '' : cat)}
                className={cn('px-2.5 py-1 rounded-full text-xs transition-colors', categoryFilter === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground')}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0">
            {filteredCatalog.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No items found.</p>
            ) : (
              filteredCatalog.map((cat) => {
                const added = addedCatalogIds.has(cat.id);
                return (
                  <div
                    key={cat.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat.brand || cat.category}</p>
                    </div>
                    <button
                      onClick={() => handleAddFromCatalog(cat)}
                      disabled={added}
                      title={added ? 'Already added' : 'Add to list'}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors flex-shrink-0',
                        added ? 'text-emerald-500 cursor-default' : 'text-muted-foreground hover:text-foreground hover:bg-border',
                      )}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {addTab === 'mygear' && (
        <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0">
          {filteredUserGear.length === 0 ? (
            <EmptyState
              icon={<Package size={28} />}
              title="No personal gear"
              description="Add items in My Gear first."
            />
          ) : (
            filteredUserGear.map((gear) => {
              const cat = catalogMap.get(gear.catalogItemId);
              if (!cat) return null;
              const added = addedUserGearIds.has(gear.id);
              return (
                <div
                  key={gear.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {gear.condition}{gear.serialNumber ? ` · ${gear.serialNumber}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddFromMyGear(gear)}
                    disabled={added}
                    title={added ? 'Already added' : 'Add to list'}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors flex-shrink-0',
                      added ? 'text-emerald-500 cursor-default' : 'text-muted-foreground hover:text-foreground hover:bg-border',
                    )}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-shrink-0 space-y-1">
        <Link
          to={`/projects/${projectId}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          {project?.name ?? 'Project'}
        </Link>
        <div className="flex items-center justify-between gap-4">
          <h1>Gear List</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{listItems.length} item{listItems.length !== 1 ? 's' : ''}</span>
            {listItems.length > 0 && (
              <>
                <Button variant="secondary" onClick={handleExportCSV}>
                  <Download size={14} />
                  Export
                </Button>
                <Button
                  variant={isPublished ? 'primary' : 'secondary'}
                  onClick={handleTogglePublish}
                >
                  {isPublished ? <Check size={14} /> : <Send size={14} />}
                  {isPublished ? 'Published' : 'Publish'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-1 lg:hidden flex-shrink-0">
        {(['list', 'add'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-colors',
              mobileTab === tab ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
            )}
          >
            {tab === 'list' ? 'Gear List' : 'Add Gear'}
          </button>
        ))}
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className={cn('lg:w-3/5 lg:flex flex-col min-h-0', mobileTab === 'add' ? 'hidden' : 'flex w-full')}>
          {GearListPanel}
        </div>
        <div className={cn('lg:w-2/5 lg:flex flex-col min-h-0 border-l border-border pl-4', mobileTab === 'list' ? 'hidden lg:flex' : 'flex w-full')}>
          {AddGearPanel}
        </div>
      </div>

      {editingItem && (
        <GearListEditModal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          item={editingItem}
          catalogItemName={catalogMap.get(editingItem.catalogItemId)?.name ?? ''}
          onUpdated={() => { load(); setEditingItem(null); }}
        />
      )}
    </div>
  );
}
