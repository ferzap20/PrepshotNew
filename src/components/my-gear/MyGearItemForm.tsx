import { useState, useEffect, type FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { GearCondition } from '@/types/enums';
import { catalogItemsRepo } from '@/lib/db/repositories';
import type { UserGearItem, CatalogItem } from '@/types/models';

const CONDITION_OPTIONS = Object.values(GearCondition).map((c) => ({ value: c, label: c }));

interface MyGearItemFormProps {
  initial?: Partial<UserGearItem>;
  /** If editing, the catalog item is fixed. If creating, user picks from list. */
  fixedCatalogItem?: CatalogItem;
  onSubmit: (data: Omit<UserGearItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

export function MyGearItemForm({ initial, fixedCatalogItem, onSubmit, onCancel, submitLabel }: MyGearItemFormProps) {
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [catalogItemId, setCatalogItemId] = useState(initial?.catalogItemId ?? fixedCatalogItem?.id ?? '');
  const [serialNumber, setSerialNumber] = useState(initial?.serialNumber ?? '');
  const [condition, setCondition] = useState<GearCondition>(initial?.condition ?? GearCondition.Good);
  const [purchaseDate, setPurchaseDate] = useState(initial?.purchaseDate ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? 1));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (fixedCatalogItem) return;
    catalogItemsRepo.getAll().then((data) => {
      data.sort((a, b) => a.name.localeCompare(b.name));
      setCatalogItems(data);
      if (!catalogItemId && data.length > 0) setCatalogItemId(data[0].id);
    });
  }, [fixedCatalogItem, catalogItemId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!catalogItemId) { setError('Please select an item from the catalog'); return; }
    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) { setError('Quantity must be at least 1'); return; }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({
        catalogItemId,
        serialNumber: serialNumber.trim(),
        condition,
        purchaseDate: purchaseDate || null,
        notes: notes.trim(),
        quantity: qty,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const catalogOptions = catalogItems.map((c) => ({ value: c.id, label: `${c.name}${c.brand ? ` — ${c.brand}` : ''}` }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fixedCatalogItem ? (
        <div className="px-3 py-2 rounded-lg bg-secondary text-sm">
          <span className="font-medium">{fixedCatalogItem.name}</span>
          {fixedCatalogItem.brand && (
            <span className="text-muted-foreground"> — {fixedCatalogItem.brand}</span>
          )}
        </div>
      ) : (
        <Select
          label="Catalog Item"
          value={catalogItemId}
          onChange={(e) => setCatalogItemId(e.target.value)}
          options={catalogOptions}
        />
      )}
      <div className="grid grid-cols-2 gap-3">
        <Input label="Serial Number" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="Optional" />
        <Input label="Quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      </div>
      <Select
        label="Condition"
        value={condition}
        onChange={(e) => setCondition(e.target.value as GearCondition)}
        options={CONDITION_OPTIONS}
      />
      <Input label="Purchase Date" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
      <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes about this item" />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? `${submitLabel}...` : submitLabel}
        </Button>
      </div>
    </form>
  );
}
