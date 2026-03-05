import { useState, useEffect } from 'react';
import { Plus, Wrench, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  AddMyGearItemModal,
  EditMyGearItemModal,
  DeleteMyGearItemDialog,
} from '@/components/my-gear/MyGearItemModals';
import { DebugFileBadge } from '@/components/debug/DebugFileBadge';
import { userGearRepo, catalogItemsRepo } from '@/lib/db/repositories';
import { useAuth } from '@/hooks/useAuth';
import { formatShortDate } from '@/lib/utils/date';
import type { UserGearItem, CatalogItem } from '@/types/models';

type GearRow = { gear: UserGearItem; catalog: CatalogItem | undefined };

const CONDITION_VARIANT: Record<string, 'default' | 'info' | 'warning' | 'danger'> = {
  Excellent: 'info',
  Good: 'default',
  Fair: 'warning',
  'Needs Repair': 'danger',
};

export function MyGearPage() {
  const { session } = useAuth();
  const [rows, setRows] = useState<GearRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<GearRow | null>(null);
  const [deletingRow, setDeletingRow] = useState<GearRow | null>(null);

  const load = async () => {
    if (!session) return;
    setIsLoading(true);
    const gearItems = await userGearRepo.getByUserId(session.userId);
    const catalogMap = new Map<string, CatalogItem>();
    const catalogIds = [...new Set(gearItems.map((g) => g.catalogItemId))];
    await Promise.all(
      catalogIds.map(async (id) => {
        const item = await catalogItemsRepo.getById(id);
        if (item) catalogMap.set(id, item);
      }),
    );
    const sorted = gearItems
      .map((gear) => ({ gear, catalog: catalogMap.get(gear.catalogItemId) }))
      .sort((a, b) => (a.catalog?.name ?? '').localeCompare(b.catalog?.name ?? ''));
    setRows(sorted);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, [session]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1>My Gear</h1>
            <DebugFileBadge />
          </div>
          <p className="text-sm text-muted-foreground mt-1">Your personal equipment collection.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus size={16} />
          Add Item
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Wrench size={32} />}
          title="No gear yet"
          description="Add items from the catalog to build your personal equipment list."
          action={
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus size={16} />
              Add Item
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {rows.map(({ gear, catalog }) => (
            <Card key={gear.id} className="flex items-start gap-4 py-3 px-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{catalog?.name ?? 'Unknown item'}</span>
                  {catalog?.category && <Badge variant="default">{catalog.category}</Badge>}
                  <Badge variant={CONDITION_VARIANT[gear.condition] ?? 'default'}>{gear.condition}</Badge>
                  {gear.quantity > 1 && (
                    <span className="text-xs text-muted-foreground">×{gear.quantity}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {catalog?.brand && (
                    <span className="text-xs text-muted-foreground">{catalog.brand}</span>
                  )}
                  {gear.serialNumber && (
                    <span className="text-xs text-muted-foreground">S/N: {gear.serialNumber}</span>
                  )}
                  {gear.purchaseDate && (
                    <span className="text-xs text-muted-foreground">
                      Purchased {formatShortDate(gear.purchaseDate)}
                    </span>
                  )}
                </div>
                {gear.notes && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{gear.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setEditingRow({ gear, catalog })}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeletingRow({ gear, catalog })}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                  aria-label="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddMyGearItemModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdded={() => load()}
      />

      {editingRow && (
        <EditMyGearItemModal
          isOpen={true}
          onClose={() => setEditingRow(null)}
          gearItem={editingRow.gear}
          catalogItem={editingRow.catalog}
          onUpdated={() => { load(); setEditingRow(null); }}
        />
      )}

      {deletingRow && (
        <DeleteMyGearItemDialog
          isOpen={true}
          onClose={() => setDeletingRow(null)}
          gearItem={deletingRow.gear}
          itemName={deletingRow.catalog?.name ?? 'Unknown item'}
          onDeleted={() => { load(); setDeletingRow(null); }}
        />
      )}
    </div>
  );
}
