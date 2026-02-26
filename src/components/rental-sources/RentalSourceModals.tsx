import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { RentalSourceForm } from './RentalSourceForm';
import { rentalSourcesRepo } from '@/lib/db/repositories';
import type { RentalSource } from '@/types/models';

// ── Create ────────────────────────────────────────────────────────────────────

interface CreateRentalSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (source: RentalSource) => void;
}

export function CreateRentalSourceModal({ isOpen, onClose, onCreated }: CreateRentalSourceModalProps) {
  const handleSubmit = async (data: Omit<RentalSource, 'id' | 'createdAt' | 'updatedAt'>) => {
    const source = await rentalSourcesRepo.create(data);
    onCreated(source);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Rental Source">
      <RentalSourceForm onSubmit={handleSubmit} onCancel={onClose} submitLabel="Add Source" />
    </Modal>
  );
}

// ── Edit ──────────────────────────────────────────────────────────────────────

interface EditRentalSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: RentalSource;
  onUpdated: (source: RentalSource) => void;
}

export function EditRentalSourceModal({ isOpen, onClose, source, onUpdated }: EditRentalSourceModalProps) {
  const handleSubmit = async (data: Omit<RentalSource, 'id' | 'createdAt' | 'updatedAt'>) => {
    const updated = await rentalSourcesRepo.update(source.id, data);
    if (updated) onUpdated(updated);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Rental Source">
      <RentalSourceForm initial={source} onSubmit={handleSubmit} onCancel={onClose} submitLabel="Save Changes" />
    </Modal>
  );
}

// ── Delete ────────────────────────────────────────────────────────────────────

interface DeleteRentalSourceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  source: RentalSource;
  onDeleted: () => void;
}

export function DeleteRentalSourceDialog({ isOpen, onClose, source, onDeleted }: DeleteRentalSourceDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await rentalSourcesRepo.remove(source.id);
      onDeleted();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Rental Source">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Delete <span className="text-foreground font-medium">"{source.name}"</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
