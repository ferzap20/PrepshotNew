import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Trash2, ChevronDown, ChevronRight, Search, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { shootingDaysRepo } from '@/lib/db/repositories';
import { useShootingDayDetail } from '@/hooks/useShootingDayDetail';
import { useAppSetting } from '@/hooks/useAppSetting';
import { formatDateCustom } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { ModificationType } from '@/types/enums';

export function ShootingDayPage() {
  const { projectId, dayId } = useParams<{ projectId: string; dayId: string }>();
  const navigate = useNavigate();
  const dateFormat = useAppSetting('date_format', 'DD/MM/YYYY');
  const personalItemLabel = useAppSetting('personal_item_label', 'personal item');

  const {
    day,
    baseItems,
    catalogMap,
    modByCatalogId,
    removedIds,
    addMods,
    effectiveGrouped,
    filteredCatalog,
    totalEffective,
    isLoading,
    notes,
    setNotes,
    notesSaved,
    search,
    setSearch,
    saveNotes,
    toggleRemove,
    adjustQty,
    addItem,
    removeAdd,
  } = useShootingDayDetail(projectId, dayId);

  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [rightTab, setRightTab] = useState<'adjust' | 'add'>('adjust');
  const [mobileTab, setMobileTab] = useState<'list' | 'modify'>('list');

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!dayId || !projectId) return;
    await shootingDaysRepo.remove(dayId);
    navigate(`/projects/${projectId}/days`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 bg-secondary rounded animate-pulse" />
        <div className="h-64 bg-secondary rounded-xl animate-pulse" />
      </div>
    );
  }

  const EffectiveList = (
    <div className="flex flex-col gap-2 overflow-y-auto h-full pr-0.5">
      <div className="flex-shrink-0 mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Notes</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
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
                          {rowNotes && (
                            <span className="text-xs text-muted-foreground truncate">{rowNotes}</span>
                          )}
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

      {removedIds.size > 0 && (
        <div className="mt-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-1.5">
            Removed for this day
          </p>
          {Array.from(removedIds).map((catId) => {
            const cat = catalogMap.get(catId);
            if (!cat) return null;
            return (
              <div
                key={catId}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/30 mb-1.5 opacity-60"
              >
                <span className="text-sm flex-1 line-through">{cat.name}</span>
                <button
                  onClick={() => toggleRemove(catId)}
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

  const ModifyPanel = (
    <div className="flex flex-col h-full gap-3">
      <div className="flex gap-1 flex-shrink-0">
        {(['adjust', 'add'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setRightTab(tab)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-colors',
              rightTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground',
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
              const currentQty =
                modMod?.modificationType === ModificationType.Modify
                  ? modMod.quantity
                  : item.quantity;
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
                        onClick={() =>
                          adjustQty(item.catalogItemId, Math.max(1, currentQty - 1), item.quantity)
                        }
                        className="w-6 h-6 flex items-center justify-center rounded bg-secondary hover:bg-border text-sm transition-colors"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm">{currentQty}</span>
                      <button
                        onClick={() => adjustQty(item.catalogItemId, currentQty + 1, item.quantity)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-secondary hover:bg-border text-sm transition-colors"
                      >
                        +
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => toggleRemove(item.catalogItemId)}
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
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>

          {addMods.length > 0 && (
            <div className="flex flex-col gap-1 flex-shrink-0">
              <p className="text-xs text-muted-foreground px-1">Added for this day:</p>
              {addMods.map((mod) => {
                const cat = catalogMap.get(mod.catalogItemId);
                if (!cat) return null;
                return (
                  <div
                    key={mod.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10"
                  >
                    <span className="text-sm flex-1 truncate">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">×{mod.quantity}</span>
                    <button
                      onClick={() => removeAdd(mod.id)}
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
                    onClick={() => addItem(cat)}
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
            <p className="text-xs text-muted-foreground">
              {totalEffective} item{totalEffective !== 1 ? 's' : ''} planned
            </p>
          </div>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 size={14} />
            Delete Day
          </Button>
        </div>
      </div>

      <div className="flex gap-1 lg:hidden flex-shrink-0">
        {(['list', 'modify'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-colors',
              mobileTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground',
            )}
          >
            {tab === 'list' ? 'Gear List' : 'Modify'}
          </button>
        ))}
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div
          className={cn(
            'lg:w-3/5 lg:flex flex-col min-h-0',
            mobileTab === 'modify' ? 'hidden' : 'flex w-full',
          )}
        >
          {EffectiveList}
        </div>
        <div
          className={cn(
            'lg:w-2/5 lg:flex flex-col min-h-0 border-l border-border pl-4',
            mobileTab === 'list' ? 'hidden lg:flex' : 'flex w-full',
          )}
        >
          {ModifyPanel}
        </div>
      </div>
    </div>
  );
}
