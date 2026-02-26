import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { MyGearItemForm } from './MyGearItemForm';
import { userGearRepo } from '@/lib/db/repositories';
import { useAuth } from '@/hooks/useAuth';
import type { UserGearItem, CatalogItem } from '@/types/models';

// ── Add ───────────────────────────────────────────────────────────────────────

interface AddMyGearItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: (item: UserGearItem) => void;
}

export function AddMyGearItemModal({ isOpen, onClose, onAdded }: AddMyGearItemModalProps) {
  const { session } = useAuth();

  const handleSubmit = async (data: Omit<UserGearItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!session) return;
    const item = await userGearRepo.create({ ...data, userId: session.userId });
    onAdded(item);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to My Gear">
      <MyGearItemForm onSubmit={handleSubmit} onCancel={onClose} submitLabel="Add to My Gear" />
    </Modal>
  );
}

// ── Edit ──────────────────────────────────────────────────────────────────────

interface EditMyGearItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  gearItem: UserGearItem;
  catalogItem: CatalogItem | undefined;
  onUpdated: (item: UserGearItem) => void;
}

export function EditMyGearItemModal({ isOpen, onClose, gearItem, catalogItem, onUpdated }: EditMyGearItemModalProps) {
  const handleSubmit = async (data: Omit<UserGearItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const updated = await userGearRepo.update(gearItem.id, data);
    if (updated) onUpdated(updated);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Gear Item">
      <MyGearItemForm
        initial={gearItem}
        fixedCatalogItem={catalogItem}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Save Changes"
      />
    </Modal>
  );
}

// ── Delete ────────────────────────────────────────────────────────────────────

interface DeleteMyGearItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gearItem: UserGearItem;
  itemName: string;
  onDeleted: () => void;
}

export function DeleteMyGearItemDialog({ isOpen, onClose, gearItem, itemName, onDeleted }: DeleteMyGearItemDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await userGearRepo.remove(gearItem.id);
      onDeleted();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Remove from My Gear">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Remove <span className="text-foreground font-medium">"{itemName}"</span> from your gear list?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Removing...' : 'Remove'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
