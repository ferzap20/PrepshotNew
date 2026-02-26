import { Modal } from '@/components/ui/Modal';
import { ProjectForm } from './ProjectForm';
import { projectsRepo } from '@/lib/db/repositories';
import { useAuth } from '@/hooks/useAuth';
import type { Project } from '@/types/models';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export function CreateProjectModal({ isOpen, onClose, onCreated }: CreateProjectModalProps) {
  const { session } = useAuth();

  const handleSubmit = async (
    data: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ) => {
    if (!session) return;
    const project = await projectsRepo.create({ ...data, userId: session.userId });
    onCreated(project);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Project">
      <ProjectForm onSubmit={handleSubmit} onCancel={onClose} submitLabel="Create Project" />
    </Modal>
  );
}
