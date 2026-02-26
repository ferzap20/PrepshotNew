import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Package, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  CreateCatalogItemModal,
  EditCatalogItemModal,
  DeleteCatalogItemDialog,
} from '@/components/catalog/CatalogItemModals';
import { catalogItemsRepo } from '@/lib/db/repositories';
import { useAuth } from '@/hooks/useAuth';
import { UserRole, CatalogCategory } from '@/types/enums';
import { cn } from '@/lib/utils/cn';
import type { CatalogItem } from '@/types/models';

const ALL = 'All';
const CATEGORY_FILTERS = [ALL, ...Object.values(CatalogCategory)];

export function CatalogPage() {
  const { session } = useAuth();
  const isAdmin = session?.role === UserRole.Admin;

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<CatalogItem | null>(null);

  const load = async () => {
    setIsLoading(true);
    const data = await catalogItemsRepo.getAll();
    data.sort((a, b) => a.name.localeCompare(b.name));
    setItems(data);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((item) => {
      const matchCat = activeCategory === ALL || item.category === activeCategory;
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.aliases.some((a) => a.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [items, search, activeCategory]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1>Catalog</h1>
        {isAdmin && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} />
            Add Item
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand, or alias…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={32} />}
          title={items.length === 0 ? 'No items in catalog' : 'No results'}
          description={
            items.length === 0
              ? isAdmin
                ? 'Add the first item to the catalog.'
                : 'The catalog is empty. Ask an admin to add items.'
              : 'Try adjusting your search or category filter.'
          }
          action={
            isAdmin && items.length === 0 ? (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus size={16} />
                Add Item
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <Card key={item.id} className="flex items-start gap-4 py-3 px-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="default">{item.category}</Badge>
                  {item.brand && (
                    <span className="text-xs text-muted-foreground">{item.brand}</span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                )}
                {item.aliases.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Also known as: {item.aliases.join(', ')}
                  </p>
                )}
              </div>
              {isAdmin && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    aria-label="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeletingItem(item)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {isAdmin && (
        <>
          <CreateCatalogItemModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onCreated={() => load()}
          />
          {editingItem && (
            <EditCatalogItemModal
              isOpen={true}
              onClose={() => setEditingItem(null)}
              item={editingItem}
              onUpdated={() => { load(); setEditingItem(null); }}
            />
          )}
          {deletingItem && (
            <DeleteCatalogItemDialog
              isOpen={true}
              onClose={() => setDeletingItem(null)}
              item={deletingItem}
              onDeleted={() => { load(); setDeletingItem(null); }}
            />
          )}
        </>
      )}
    </div>
  );
}
