import { useState, useEffect } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { OnboardingModal } from '@/components/ui/OnboardingModal';
import { DebugFileBadge } from '@/components/debug/DebugFileBadge';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { projectGeneralListsRepo, usersRepo } from '@/lib/db/repositories';
import type { Project } from '@/types/models';

export function HomePage() {
  const { session } = useAuth();
  const { projects, isLoading, refresh } = useProjects();
  const [equipmentCounts, setEquipmentCounts] = useState<Record<string, number>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (!session?.userId) return;
    usersRepo.getById(session.userId).then((user) => {
      const name = user?.name?.trim() || session.email.split('@')[0];
      setDisplayName(name);
    });
  }, [session?.userId, session?.email]);

  useEffect(() => {
    if (projects.length === 0) return;
    const fetchCounts = async () => {
      const entries = await Promise.all(
        projects.map(async (p) => {
          const items = await projectGeneralListsRepo.getByProjectId(p.id);
          return [p.id, items.length] as [string, number];
        }),
      );
      setEquipmentCounts(Object.fromEntries(entries));
    };
    fetchCounts();
  }, [projects]);

  const handleCreated = (_project: Project) => {
    refresh();
  };

  return (
    <>
    <OnboardingModal />
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1>Welcome back, {displayName}</h1>
            <DebugFileBadge />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {projects.length > 0
              ? `You have ${projects.length} project${projects.length !== 1 ? 's' : ''}.`
              : 'Create your first project to get started.'}
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="flex-shrink-0">
          <Plus size={16} />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-secondary animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={32} />}
          title="No projects yet"
          description="Create your first project to start managing equipment and shooting days."
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus size={16} />
              New Project
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              equipmentCount={equipmentCounts[project.id] ?? 0}
            />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
    </>
  );
}
