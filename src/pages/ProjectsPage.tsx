import { useState, useEffect } from 'react';
import { Plus, FolderOpen, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';
import { useProjects } from '@/hooks/useProjects';
import { projectGeneralListsRepo } from '@/lib/db/repositories';
import { formatShortDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import type { Project } from '@/types/models';

function ProjectRowCard({
  project,
  equipmentCount,
  onEdit,
  onDelete,
}: {
  project: Project;
  equipmentCount: number;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const dateRange =
    project.startDate && project.endDate
      ? `${formatShortDate(project.startDate)} – ${formatShortDate(project.endDate)}`
      : project.startDate
        ? `From ${formatShortDate(project.startDate)}`
        : 'No dates set';

  return (
    <Card className="flex items-center gap-4 py-3 px-4">
      <Link to={`/projects/${project.id}`} className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-medium truncate">{project.name}</span>
          {project.crewType && <Badge variant="info">{project.crewType}</Badge>}
          {(project.productionCompany || project.role) && (
            <Badge variant="default">{project.productionCompany || project.role}</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {dateRange} · {equipmentCount} item{equipmentCount !== 1 ? 's' : ''}
        </p>
      </Link>

      <div className="relative flex-shrink-0">
        <button
          onClick={(e) => { e.preventDefault(); setMenuOpen((v) => !v); }}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Actions"
        >
          <MoreVertical size={16} />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className={cn(
              'absolute right-0 top-8 z-20 min-w-[140px] rounded-lg border border-border bg-surface shadow-lg py-1',
            )}>
              <button
                onClick={() => { setMenuOpen(false); onEdit(project); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary transition-colors text-left"
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete(project); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary transition-colors text-left text-destructive"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

export function ProjectsPage() {
  const { projects, isLoading, refresh } = useProjects();
  const [equipmentCounts, setEquipmentCounts] = useState<Record<string, number>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1>Projects</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-secondary animate-pulse" />
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
        <div className="space-y-2">
          {projects.map((project) => (
            <ProjectRowCard
              key={project.id}
              project={project}
              equipmentCount={equipmentCounts[project.id] ?? 0}
              onEdit={setEditingProject}
              onDelete={setDeletingProject}
            />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => { refresh(); }}
      />

      {editingProject && (
        <EditProjectModal
          isOpen={true}
          onClose={() => setEditingProject(null)}
          project={editingProject}
          onUpdated={() => { refresh(); setEditingProject(null); }}
        />
      )}

      {deletingProject && (
        <DeleteProjectDialog
          isOpen={true}
          onClose={() => setDeletingProject(null)}
          project={deletingProject}
          onDeleted={() => { refresh(); setDeletingProject(null); }}
        />
      )}
    </div>
  );
}
