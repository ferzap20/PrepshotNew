import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Pencil, Copy, Trash2, Package, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { DuplicateProjectModal } from '@/components/projects/DuplicateProjectModal';
import { DebugFileBadge } from '@/components/debug/DebugFileBadge';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';
import { ProjectGearListPreview } from '@/components/project/ProjectGearListPreview';
import { ExportMenu } from '@/components/project/ExportMenu';
import { projectsRepo, projectGeneralListsRepo, catalogItemsRepo, usersRepo } from '@/lib/db/repositories';
import { formatDateCustom } from '@/lib/utils/date';
import { useAppSetting } from '@/hooks/useAppSetting';
import { useAuth } from '@/hooks/useAuth';
import type { Project, ProjectGeneralListItem, CatalogItem, User } from '@/types/models';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [listItems, setListItems] = useState<ProjectGeneralListItem[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [listUsers, setListUsers] = useState<User[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      setIsLoading(true);
      const p = await projectsRepo.getById(projectId);
      if (!p) { navigate('/projects', { replace: true }); return; }
      setProject(p);
      const [items, catalog, users] = await Promise.all([
        projectGeneralListsRepo.getByProjectId(projectId),
        catalogItemsRepo.getAll(),
        usersRepo.getAll(),
      ]);
      setListItems(items);
      setCatalogItems(catalog);
      setListUsers(users);
      setIsLoading(false);
    };
    load();
  }, [projectId, navigate]);

  const dateFormat = useAppSetting('date_format', 'DD/MM/YYYY');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-24 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/projects"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Projects
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
            <Pencil size={14} />
            Edit
          </Button>
          <Button variant="secondary" onClick={() => setIsDuplicateOpen(true)}>
            <Copy size={14} />
            Duplicate
          </Button>
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>

      {/* Project header */}
      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1>{project.name}</h1>
            <DebugFileBadge />
          </div>
          {project.productionCompany && (
            <span className="w-fit">
              <Badge variant="info">{project.productionCompany}</Badge>
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          {(project.crewType || project.role) && (
            <div className="flex items-center gap-2">
              {project.crewType && <span>{project.crewType}</span>}
              {project.role && <Badge variant="default">{project.role}</Badge>}
              {project.firstAC && <span className="text-muted-foreground/60">· 1st AC: {project.firstAC}</span>}
            </div>
          )}
          {project.trialStartDate && (
            <div className="flex items-center gap-2">
              <span className="w-24 text-xs uppercase tracking-wide flex items-center gap-1"><Calendar size={12} />Trial</span>
              <span>
                {project.trialEndDate
                  ? `${formatDateCustom(project.trialStartDate, dateFormat)} – ${formatDateCustom(project.trialEndDate, dateFormat)}`
                  : `From ${formatDateCustom(project.trialStartDate, dateFormat)}`}
              </span>
            </div>
          )}
          {project.startDate && (
            <div className="flex items-center gap-2">
              <span className="w-24 text-xs uppercase tracking-wide flex items-center gap-1"><Calendar size={12} />Shoot</span>
              <span>
                {project.endDate
                  ? `${formatDateCustom(project.startDate, dateFormat)} – ${formatDateCustom(project.endDate, dateFormat)}`
                  : `From ${formatDateCustom(project.startDate, dateFormat)}`}
              </span>
            </div>
          )}
          {!project.trialStartDate && !project.startDate && (
            <div className="text-sm italic text-muted-foreground">No dates added to this project</div>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Notes</p>
          {project.notes ? (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.notes}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground">No notes added</p>
          )}
        </div>
      </div>

      {/* Gear list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Gear List</h2>
          </div>
          <div className="flex items-center gap-3">
            <ExportMenu
              projectId={project.id}
              project={project}
              items={listItems}
              catalogItems={catalogItems}
            />
            <Link
              to={`/projects/${project.id}/list`}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Edit →
            </Link>
          </div>
        </div>
        <Card>
          <ProjectGearListPreview
            items={listItems}
            catalogItems={catalogItems}
            users={listUsers}
          />
        </Card>
      </div>

      <EditProjectModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        project={project}
        onUpdated={(updated) => { setProject(updated); setIsEditOpen(false); }}
      />

      {session && (
        <DuplicateProjectModal
          isOpen={isDuplicateOpen}
          onClose={() => setIsDuplicateOpen(false)}
          project={project}
          userId={session.userId}
        />
      )}

      <DeleteProjectDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        project={project}
        onDeleted={() => navigate('/projects', { replace: true })}
      />
    </div>
  );
}
