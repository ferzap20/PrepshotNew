import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  projectsRepo,
  projectGeneralListsRepo,
  shootingDaysRepo,
  dayListModificationsRepo,
} from '@/lib/db/repositories';
import type { Project } from '@/types/models';

interface DuplicateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  userId: string;
}

export function DuplicateProjectModal({
  isOpen,
  onClose,
  project,
  userId,
}: DuplicateProjectModalProps) {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState(`${project.name} (Copy)`);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [error, setError] = useState('');

  const handleDuplicate = async () => {
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    setIsDuplicating(true);
    try {
      // Create the duplicated project
      const newProject = await projectsRepo.duplicate(project.id, userId);
      if (!newProject) throw new Error('Failed to duplicate project');

      // Update the name
      await projectsRepo.update(newProject.id, { name: projectName.trim() });

      // Copy general list items
      const listItems = await projectGeneralListsRepo.getByProjectId(project.id);
      const itemMap = new Map<string, string>(); // old id -> new id
      for (const item of listItems) {
        const newItem = await projectGeneralListsRepo.create({
          projectId: newProject.id,
          userId,
          catalogItemId: item.catalogItemId,
          quantity: item.quantity,
          notes: item.notes,
          isRequired: item.isRequired,
          published: item.published,
          source: item.source,
          userGearId: item.userGearId,
        });
        itemMap.set(item.id, newItem.id);
      }

      // Copy shooting days and their modifications
      const days = await shootingDaysRepo.getByProjectId(project.id);
      const dayMap = new Map<string, string>(); // old day id -> new day id
      for (const day of days) {
        const newDay = await shootingDaysRepo.create({
          projectId: newProject.id,
          date: day.date,
          notes: day.notes,
        });
        dayMap.set(day.id, newDay.id);

        // Copy modifications for this day
        const mods = await dayListModificationsRepo.getByDayId(day.id);
        for (const mod of mods) {
          await dayListModificationsRepo.create({
            dayId: newDay.id,
            catalogItemId: mod.catalogItemId,
            modificationType: mod.modificationType,
            quantity: mod.quantity,
            notes: mod.notes,
            isRequired: mod.isRequired,
          });
        }
      }

      // Success - navigate to the new project
      onClose();
      navigate(`/projects/${newProject.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate project');
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Duplicate Project">
      <div className="space-y-4">
        <Input
          label="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Enter project name"
          autoFocus
        />
        <p className="text-sm text-muted-foreground">
          This will create a copy of this project including all gear lists, shooting days, and modifications.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isDuplicating}>
            Cancel
          </Button>
          <Button onClick={handleDuplicate} disabled={isDuplicating}>
            {isDuplicating ? 'Duplicating…' : 'Duplicate'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
