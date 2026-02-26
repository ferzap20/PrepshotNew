import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CatalogItemForm } from './CatalogItemForm';
import { catalogItemsRepo } from '@/lib/db/repositories';
import type { CatalogItem } from '@/types/models';

// ── Create ────────────────────────────────────────────────────────────────────

interface CreateCatalogItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (item: CatalogItem) => void;
}

export function CreateCatalogItemModal({ isOpen, onClose, onCreated }: CreateCatalogItemModalProps) {
  const handleSubmit = async (data: Omit<CatalogItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const item = await catalogItemsRepo.create(data);
    onCreated(item);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Catalog Item">
      <CatalogItemForm onSubmit={handleSubmit} onCancel={onClose} submitLabel="Add Item" />
    </Modal>
  );
}

// ── Edit ──────────────────────────────────────────────────────────────────────

interface EditCatalogItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CatalogItem;
  onUpdated: (item: CatalogItem) => void;
}

export function EditCatalogItemModal({ isOpen, onClose, item, onUpdated }: EditCatalogItemModalProps) {
  const handleSubmit = async (data: Omit<CatalogItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const updated = await catalogItemsRepo.update(item.id, data);
    if (updated) onUpdated(updated);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Catalog Item">
      <CatalogItemForm initial={item} onSubmit={handleSubmit} onCancel={onClose} submitLabel="Save Changes" />
    </Modal>
  );
}

// ── Delete ────────────────────────────────────────────────────────────────────

interface DeleteCatalogItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: CatalogItem;
  onDeleted: () => void;
}

export function DeleteCatalogItemDialog({ isOpen, onClose, item, onDeleted }: DeleteCatalogItemDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await catalogItemsRepo.remove(item.id);
      onDeleted();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Item">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{' '}
          <span className="text-foreground font-medium">"{item.name}"</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
