import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  projectsRepo,
  projectGeneralListsRepo,
  shootingDaysRepo,
  dayListModificationsRepo,
  dailyDocumentsRepo,
} from '@/lib/db/repositories';
import type { Project } from '@/types/models';

interface DeleteProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onDeleted: () => void;
}

export function DeleteProjectDialog({
  isOpen,
  onClose,
  project,
  onDeleted,
}: DeleteProjectDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Cascade: delete gear list items
      const listItems = await projectGeneralListsRepo.getByProjectId(project.id);
      await Promise.all(listItems.map((i) => projectGeneralListsRepo.remove(i.id)));

      // Cascade: delete shooting days + their modifications and documents
      const days = await shootingDaysRepo.getByProjectId(project.id);
      for (const day of days) {
        const mods = await dayListModificationsRepo.getByDayId(day.id);
        await Promise.all(mods.map((m) => dayListModificationsRepo.remove(m.id)));
        const docs = await dailyDocumentsRepo.getByDayId(day.id);
        await Promise.all(docs.map((d) => dailyDocumentsRepo.remove(d.id)));
        await shootingDaysRepo.remove(day.id);
      }

      await projectsRepo.remove(project.id);
      onDeleted();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Project">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{' '}
          <span className="text-foreground font-medium">"{project.name}"</span>? This will also
          delete all shooting days, gear lists, and documents. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Project'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
