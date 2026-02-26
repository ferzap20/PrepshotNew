import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { projectGeneralListsRepo } from '@/lib/db/repositories';
import type { ProjectGeneralListItem } from '@/types/models';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: ProjectGeneralListItem;
  catalogItemName: string;
  onUpdated: () => void;
}

export function GearListEditModal({ isOpen, onClose, item, catalogItemName, onUpdated }: Props) {
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [notes, setNotes] = useState(item.notes);
  const [isRequired, setIsRequired] = useState(item.isRequired);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    setIsSaving(true);
    await projectGeneralListsRepo.update(item.id, { quantity: qty, notes, isRequired });
    setIsSaving(false);
    onUpdated();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={catalogItemName}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <Input
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes…"
        />
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isRequired}
            onChange={(e) => setIsRequired(e.target.checked)}
            className="w-4 h-4 rounded accent-primary"
          />
          <span className="text-sm">Required</span>
        </label>
        <div className="flex gap-2 pt-1">
          <Button type="submit" disabled={isSaving}>Save</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}
