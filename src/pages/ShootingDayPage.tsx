import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Trash2, ChevronDown, ChevronRight, Search, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  projectsRepo,
  shootingDaysRepo,
  projectGeneralListsRepo,
  dayListModificationsRepo,
  catalogItemsRepo,
} from '@/lib/db/repositories';
import { useAppSetting } from '@/hooks/useAppSetting';
import { formatDateCustom } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { CatalogCategory, ModificationType } from '@/types/enums';
import type {
  Project,
  ShootingDay,
  ProjectGeneralListItem,
  DayListModification,
  CatalogItem,
} from '@/types/models';

const CATEGORY_ORDER = Object.values(CatalogCategory);

function scoreMatch(query: string, item: CatalogItem): number {
  const q = query.toLowerCase().trim();
  if (!q) return 1;
  const text = [item.name, item.brand, ...(item.aliases ?? [])].join(' ').toLowerCase();
  if (item.name.toLowerCase().startsWith(q)) return 3;
  if (text.includes(q)) return 2;
  if (q.split(/\s+/).every((w) => text.includes(w))) return 1;
  return 0;
}

export function ShootingDayPage() {
  const { projectId, dayId } = useParams<{ projectId: string; dayId: string }>();
  const navigate = useNavigate();
  const dateFormat = useAppSetting('date_format', 'DD/MM/YYYY');
  const personalItemLabel = useAppSetting('personal_item_label', 'personal item');

  const [_project, setProject] = useState<Project | null>(null);
  const [day, setDay] = useState<ShootingDay | null>(null);
  const [baseItems, setBaseItems] = useState<ProjectGeneralListItem[]>([]);
  const [mods, setMods] = useState<DayListModification[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Right panel
  const [rightTab, setRightTab] = useState<'adjust' | 'add'>('adjust');
  const [search, setSearch] = useState('');
  const [mobileTab, setMobileTab] = useState<'list' | 'modify'>('list');

  const load = async () => {
    if (!projectId || !dayId) return;
    setIsLoading(true);
    const [proj, d, items, modifications, catalog] = await Promise.all([
      projectsRepo.getById(projectId),
      shootingDaysRepo.getById(dayId),
      projectGeneralListsRepo.getByProjectId(projectId),
      dayListModificationsRepo.getByDayId(dayId),
      catalogItemsRepo.getAll(),
    ]);
    setProject(proj ?? null);
    setDay(d ?? null);
    setNotes(d?.notes ?? '');
    setBaseItems(items);
    setMods(modifications);
    setCatalogItems(catalog);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, [projectId, dayId]);

  const catalogMap = useMemo(() => new Map(catalogItems.map((c) => [c.id, c])), [catalogItems]);

  // Modification maps
  const modByCatalogId = useMemo(() => new Map(mods.map((m) => [m.catalogItemId, m])), [mods]);
  const removedIds = useMemo(
    () => new Set(mods.filter((m) => m.modificationType === ModificationType.Remove).map((m) => m.catalogItemId)),
    [mods],
  );
  const addMods = useMemo(
    () => mods.filter((m) => m.modificationType === ModificationType.Add),
    [mods],
  );

  // Effective list: base items (not removed) + Add mods
  const effectiveGrouped = useMemo(() => {
    const map = new Map<string, Array<{ catalogItem: CatalogItem; quantity: number; notes: string; isRequired: boolean; source?: string | null; badge?: string }>>()
    for (const item of baseItems) {
      if (removedIds.has(item.catalogItemId)) continue;
      const cat = catalogMap.get(item.catalogItemId);
      if (!cat) continue;
      const mod = modByCatalogId.get(item.catalogItemId);
      const quantity = mod?.modificationType === ModificationType.Modify ? mod.quantity : item.quantity;
      const modNotes = mod?.modificationType === ModificationType.Modify ? mod.notes : item.notes;
      if (!map.has(cat.category)) map.set(cat.category, []);
      map.get(cat.category)!.push({ catalogItem: cat, quantity, notes: modNotes, isRequired: item.isRequired, source: item.source });
    }
    for (const mod of addMods) {
      const cat = catalogMap.get(mod.catalogItemId);
      if (!cat) continue;
      if (!map.has(cat.category)) map.set(cat.category, []);
      map.get(cat.category)!.push({ catalogItem: cat, quantity: mod.quantity, notes: mod.notes, isRequired: mod.isRequired, badge: 'added' });
    }
    return CATEGORY_ORDER
      .filter((c) => map.has(c))
      .map((category) => ({
        category,
        rows: map.get(category)!.sort((a, b) => a.catalogItem.name.localeCompare(b.catalogItem.name)),
      }));
  }, [baseItems, mods, catalogMap, removedIds, addMods, modByCatalogId]);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const handleSaveNotes = async () => {
    if (!dayId) return;
    await shootingDaysRepo.update(dayId, { notes });
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handleDelete = async () => {
    if (!dayId || !projectId) return;
    await shootingDaysRepo.remove(dayId);
    navigate(`/projects/${projectId}/days`);
  };

  // ── Modify: toggle remove for base items ──────────────────────────────────
  const handleToggleRemove = async (catalogItemId: string) => {
    if (!dayId) return;
    const existing = modByCatalogId.get(catalogItemId);
    if (existing?.modificationType === ModificationType.Remove) {
      await dayListModificationsRepo.remove(existing.id);
    } else {
      // Remove any existing mod for this item first
      if (existing) await dayListModificationsRepo.remove(existing.id);
      await dayListModificationsRepo.create({
        dayId,
        catalogItemId,
        modificationType: ModificationType.Remove,
        quantity: 0,
        notes: '',
        isRequired: false,
      });
    }
    const updated = await dayListModificationsRepo.getByDayId(dayId);
    setMods(updated);
  };

  // ── Modify: adjust quantity for base items ────────────────────────────────
  const handleAdjustQty = async (catalogItemId: string, newQty: number, baseQty: number) => {
    if (!dayId) return;
    const existing = modByCatalogId.get(catalogItemId);
    if (newQty === baseQty) {
      if (existing?.modificationType === ModificationType.Modify) {
        await dayListModificationsRepo.remove(existing.id);
      }
    } else {
      if (existing?.modificationType === ModificationType.Modify) {
        await dayListModificationsRepo.update(existing.id, { quantity: newQty });
      } else {
        await dayListModificationsRepo.create({
          dayId,
          catalogItemId,
          modificationType: ModificationType.Modify,
          quantity: newQty,
          notes: '',
          isRequired: false,
        });
      }
    }
    const updated = await dayListModificationsRepo.getByDayId(dayId);
    setMods(updated);
  };

  // ── Add: add new item for this day ────────────────────────────────────────
  const addedCatalogIds = useMemo(
    () => new Set([...baseItems.map((i) => i.catalogItemId), ...addMods.map((m) => m.catalogItemId)]),
    [baseItems, addMods],
  );

  const handleAddItem = async (catalogItem: CatalogItem) => {
    if (!dayId || addedCatalogIds.has(catalogItem.id)) return;
    await dayListModificationsRepo.create({
      dayId,
      catalogItemId: catalogItem.id,
      modificationType: ModificationType.Add,
      quantity: 1,
      notes: '',
      isRequired: false,
    });
    const updated = await dayListModificationsRepo.getByDayId(dayId);
    setMods(updated);
  };

  const handleRemoveAdd = async (modId: string) => {
    await dayListModificationsRepo.remove(modId);
    const updated = await dayListModificationsRepo.getByDayId(dayId!);
    setMods(updated);
  };

  const filteredCatalog = useMemo(() => {
    let items = catalogItems.filter((c) => !addedCatalogIds.has(c.id));
    if (search.trim()) {
      return items
        .map((c) => ({ c, score: scoreMatch(search, c) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ c }) => c);
    }
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [catalogItems, addedCatalogIds, search]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 bg-secondary rounded animate-pulse" />
        <div className="h-64 bg-secondary rounded-xl animate-pulse" />
      </div>
    );
  }

  // ── Left panel: effective gear list ───────────────────────────────────────
  const totalEffective = effectiveGrouped.reduce((n, g) => n + g.rows.length, 0);

  const EffectiveList = (
    <div className="flex flex-col gap-2 overflow-y-auto h-full pr-0.5">
      {/* Notes */}
      <div className="flex-shrink-0 mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Notes</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleSaveNotes}
          placeholder="Day notes…"
          rows={2}
          className="w-full px-3 py-2 text-sm bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
        />
        {notesSaved && <span className="text-xs text-emerald-500">Saved</span>}
      </div>

      {effectiveGrouped.length === 0 ? (
        <EmptyState
          icon={<>📦</>}
          title="No gear for this day"
          description="All base items are removed. Use 'Modify' to restore or add items."
        />
      ) : (
        effectiveGrouped.map(({ category, rows }) => {
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
                  {rows.map(({ catalogItem, quantity, notes: rowNotes, isRequired, source, badge }) => (
                    <Card key={catalogItem.id} className="flex items-center gap-3 py-2.5 px-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium truncate">{catalogItem.name}</span>
                          {badge === 'added' && <Badge variant="info">Added</Badge>}
                          {source === 'personal' && <Badge variant="info">{personalItemLabel}</Badge>}
                          {isRequired && <Badge variant="default">Required</Badge>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">×{quantity}</span>
                          {rowNotes && <span className="text-xs text-muted-foreground truncate">{rowNotes}</span>}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Removed items */}
      {removedIds.size > 0 && (
        <div className="mt-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-1.5">
            Removed for this day
          </p>
          {Array.from(removedIds).map((catId) => {
            const cat = catalogMap.get(catId);
            if (!cat) return null;
            return (
              <div key={catId} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/30 mb-1.5 opacity-60">
                <span className="text-sm flex-1 line-through">{cat.name}</span>
                <button
                  onClick={() => handleToggleRemove(catId)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="Restore"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Right panel: modify + add ──────────────────────────────────────────────
  const ModifyPanel = (
    <div className="flex flex-col h-full gap-3">
      <div className="flex gap-1 flex-shrink-0">
        {(['adjust', 'add'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setRightTab(tab)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-colors',
              rightTab === tab ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
            )}
          >
            {tab === 'adjust' ? 'Adjust Base' : 'Add Items'}
          </button>
        ))}
      </div>

      {rightTab === 'adjust' && (
        <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0">
          {baseItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No base gear list items.</p>
          ) : (
            baseItems.map((item) => {
              const cat = catalogMap.get(item.catalogItemId);
              if (!cat) return null;
              const isRemoved = removedIds.has(item.catalogItemId);
              const modMod = modByCatalogId.get(item.catalogItemId);
              const currentQty = modMod?.modificationType === ModificationType.Modify ? modMod.quantity : item.quantity;
              return (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/50 transition-colors',
                    isRemoved && 'opacity-50',
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium truncate', isRemoved && 'line-through')}>
                      {cat.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{cat.category}</p>
                  </div>
                  {!isRemoved && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAdjustQty(item.catalogItemId, Math.max(1, currentQty - 1), item.quantity)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-secondary hover:bg-border text-sm transition-colors"
                      >−</button>
                      <span className="w-6 text-center text-sm">{currentQty}</span>
                      <button
                        onClick={() => handleAdjustQty(item.catalogItemId, currentQty + 1, item.quantity)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-secondary hover:bg-border text-sm transition-colors"
                      >+</button>
                    </div>
                  )}
                  <button
                    onClick={() => handleToggleRemove(item.catalogItemId)}
                    title={isRemoved ? 'Restore' : 'Remove for this day'}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors flex-shrink-0',
                      isRemoved
                        ? 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        : 'text-muted-foreground hover:text-destructive hover:bg-secondary',
                    )}
                  >
                    {isRemoved ? <RotateCcw size={13} /> : <Trash2 size={13} />}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {rightTab === 'add' && (
        <>
          <div className="relative flex-shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>

          {/* Added items for this day */}
          {addMods.length > 0 && (
            <div className="flex flex-col gap-1 flex-shrink-0">
              <p className="text-xs text-muted-foreground px-1">Added for this day:</p>
              {addMods.map((mod) => {
                const cat = catalogMap.get(mod.catalogItemId);
                if (!cat) return null;
                return (
                  <div key={mod.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10">
                    <span className="text-sm flex-1 truncate">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">×{mod.quantity}</span>
                    <button
                      onClick={() => handleRemoveAdd(mod.id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0">
            {filteredCatalog.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No items found.</p>
            ) : (
              filteredCatalog.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.brand || cat.category}</p>
                  </div>
                  <button
                    onClick={() => handleAddItem(cat)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border transition-colors flex-shrink-0"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex-shrink-0 space-y-1">
        <Link
          to={`/projects/${projectId}/days`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Shooting Days
        </Link>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1>{day ? formatDateCustom(day.date, dateFormat) : 'Shooting Day'}</h1>
            <p className="text-xs text-muted-foreground">{totalEffective} item{totalEffective !== 1 ? 's' : ''} planned</p>
          </div>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 size={14} />
            Delete Day
          </Button>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="flex gap-1 lg:hidden flex-shrink-0">
        {(['list', 'modify'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-colors',
              mobileTab === tab ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
            )}
          >
            {tab === 'list' ? 'Gear List' : 'Modify'}
          </button>
        ))}
      </div>

      {/* Dual panel */}
      <div className="flex gap-4 flex-1 min-h-0">
        <div className={cn('lg:w-3/5 lg:flex flex-col min-h-0', mobileTab === 'modify' ? 'hidden' : 'flex w-full')}>
          {EffectiveList}
        </div>
        <div className={cn('lg:w-2/5 lg:flex flex-col min-h-0 border-l border-border pl-4', mobileTab === 'list' ? 'hidden lg:flex' : 'flex w-full')}>
          {ModifyPanel}
        </div>
      </div>
    </div>
  );
}
