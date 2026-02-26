import { Modal } from '@/components/ui/Modal';
import { ProjectForm } from './ProjectForm';
import { projectsRepo } from '@/lib/db/repositories';
import type { Project } from '@/types/models';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdated: (project: Project) => void;
}

export function EditProjectModal({ isOpen, onClose, project, onUpdated }: EditProjectModalProps) {
  const handleSubmit = async (
    data: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ) => {
    const updated = await projectsRepo.update(project.id, data);
    if (updated) onUpdated(updated);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Project">
      <ProjectForm
        initial={project}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Save Changes"
      />
    </Modal>
  );
}
