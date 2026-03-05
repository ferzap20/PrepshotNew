import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Trash2, Pencil, ChevronDown, ChevronRight, Search, Plus, Package, Check, Send, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CategoryFilterPills } from '@/components/ui/CategoryFilterPills';
import { GearListEditModal } from '@/components/project-list/GearListEditModal';
import { DebugFileBadge } from '@/components/debug/DebugFileBadge';
import { ExportMenu } from '@/components/project/ExportMenu';
import { useGearList } from '@/hooks/useGearList';
import { useAppSetting } from '@/hooks/useAppSetting';
import { cn } from '@/lib/utils/cn';
import { CatalogCategory } from '@/types/enums';
import type { ProjectGeneralListItem } from '@/types/models';

const CATEGORY_ORDER = Object.values(CatalogCategory);

export function ProjectListPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const personalItemLabel = useAppSetting('personal_item_label', 'personal item');

  const {
    project,
    listItems,
    isLoading,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    brandFilter,
    setBrandFilter,
    brandOptions,
    catalogMap,
    addedCatalogIds,
    addedUserGearIds,
    grouped,
    filteredCatalog,
    filteredUserGear,
    isPublished,
    reload,
    addFromCatalog,
    addFromUserGear,
    exportCSV,
    deleteItem,
    togglePublish,
  } = useGearList(projectId);

  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [mobileTab, setMobileTab] = useState<'list' | 'add'>('add');
  const [addTab, setAddTab] = useState<'catalog' | 'mygear'>('catalog');
  const [editingItem, setEditingItem] = useState<ProjectGeneralListItem | null>(null);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) { next.delete(cat); } else { next.add(cat); }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  const GearListPanel = (
    <div className="flex flex-col gap-2 h-full overflow-y-auto pr-0.5">
      {grouped.length === 0 ? (
        <EmptyState
          icon={<Package size={32} />}
          title="No gear added yet"
          description="Browse the catalog or your gear on the left to add items."
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
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
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
              addTab === tab ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            {tab === 'catalog' ? 'Catalog' : 'My Gear'}
          </button>
        ))}
      </div>

      {addTab === 'catalog' && (
        <>
          <CategoryFilterPills
            categories={CATEGORY_ORDER}
            active={categoryFilter}
            onSelect={setCategoryFilter}
          />

          {brandOptions.length > 0 && (
            <CategoryFilterPills
              categories={brandOptions.map((b) => b.label)}
              active={brandOptions.find((b) => b.value === brandFilter)?.label ?? ''}
              onSelect={(label) => {
                const opt = brandOptions.find((b) => b.label === label);
                setBrandFilter(opt && opt.value !== brandFilter ? opt.value : '');
              }}
              allLabel="All brands"
            />
          )}

          <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0">
            {filteredCatalog.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No items found.</p>
            ) : (
              filteredCatalog.map((cat) => {
                const added = addedCatalogIds.has(cat.id);
                return (
                  <div
                    key={cat.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">{cat.name}</p>
                        {added && (
                          <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-500">
                            Added
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{cat.brand || cat.category}</p>
                    </div>
                    <button
                      onClick={() => addFromCatalog(cat)}
                      disabled={added}
                      title={added ? 'Already added' : 'Add to list'}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors flex-shrink-0',
                        added
                          ? 'text-emerald-500 cursor-default'
                          : 'text-muted-foreground hover:text-foreground hover:bg-border',
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {gear.condition}
                      {gear.serialNumber ? ` · ${gear.serialNumber}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => addFromUserGear(gear)}
                    disabled={added}
                    title={added ? 'Already added' : 'Add to list'}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors flex-shrink-0',
                      added
                        ? 'text-emerald-500 cursor-default'
                        : 'text-muted-foreground hover:text-foreground hover:bg-border',
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
          <div className="flex items-center gap-2">
            <h1>Gear List</h1>
            <DebugFileBadge />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {listItems.length} item{listItems.length !== 1 ? 's' : ''}
            </span>
            {listItems.length > 0 && (
              <>
                <ExportMenu
                  projectId={projectId ?? ''}
                  project={project}
                  items={listItems}
                  catalogItems={Array.from(catalogMap.values())}
                />
                <Button variant="secondary" onClick={exportCSV}>
                  <Download size={14} />
                  CSV
                </Button>
                <Button variant={isPublished ? 'primary' : 'secondary'} onClick={togglePublish}>
                  {isPublished ? <Check size={14} /> : <Send size={14} />}
                  {isPublished ? 'Published' : 'Publish'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-1 lg:hidden flex-shrink-0">
        {(['add', 'list'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-colors',
              mobileTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {tab === 'add' ? 'Add Gear' : 'Gear List'}
          </button>
        ))}
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div
          className={cn(
            'lg:w-3/5 lg:flex flex-col min-h-0',
            mobileTab === 'list' ? 'hidden' : 'flex w-full',
          )}
        >
          {AddGearPanel}
        </div>
        <div
          className={cn(
            'lg:w-2/5 lg:flex flex-col min-h-0 border-l border-border pl-4',
            mobileTab === 'add' ? 'hidden lg:flex' : 'flex w-full',
          )}
        >
          {GearListPanel}
        </div>
      </div>

      {editingItem && (
        <GearListEditModal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          item={editingItem}
          catalogItemName={catalogMap.get(editingItem.catalogItemId)?.name ?? ''}
          onUpdated={() => {
            reload();
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}
