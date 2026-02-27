import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Pencil, Copy, Trash2, Package, CalendarDays, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { DuplicateProjectModal } from '@/components/projects/DuplicateProjectModal';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';
import { projectsRepo, projectGeneralListsRepo, shootingDaysRepo } from '@/lib/db/repositories';
import { formatDateCustom } from '@/lib/utils/date';
import { useAppSetting } from '@/hooks/useAppSetting';
import { useAuth } from '@/hooks/useAuth';
import type { Project } from '@/types/models';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [equipmentCount, setEquipmentCount] = useState(0);
  const [daysCount, setDaysCount] = useState(0);
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
      const [items, days] = await Promise.all([
        projectGeneralListsRepo.getByProjectId(projectId),
        shootingDaysRepo.getByProjectId(projectId),
      ]);
      setEquipmentCount(items.length);
      setDaysCount(days.length);
      setIsLoading(false);
    };
    load();
  }, [projectId, navigate]);

  const dateFormat = useAppSetting('date_format', 'DD/MM/YYYY');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-secondary rounded animate-pulse" />
        <div className="h-24 bg-secondary rounded-xl animate-pulse" />
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
          <h1>{project.name}</h1>
          {project.productionCompany && (
            <span className="text-sm text-muted-foreground">{project.productionCompany}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          {(project.crewType || project.role) && (
            <div className="flex items-center gap-2">
              <span className="w-24 text-xs uppercase tracking-wide">Role</span>
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

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 py-3">
          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
            <Package size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-none">{equipmentCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Gear items</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 py-3">
          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
            <CalendarDays size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-none">{daysCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Shooting days</p>
          </div>
        </Card>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to={`/projects/${project.id}/list`}>
          <Card hoverable className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
              <Package size={20} className="text-primary" />
            </div>
            <div>
              <h3>Gear List</h3>
              <p className="text-xs text-muted-foreground">
                {equipmentCount} item{equipmentCount !== 1 ? 's' : ''} · Manage equipment
              </p>
            </div>
          </Card>
        </Link>

        <Link to={`/projects/${project.id}/days`}>
          <Card hoverable className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
              <CalendarDays size={20} className="text-primary" />
            </div>
            <div>
              <h3>Shooting Days</h3>
              <p className="text-xs text-muted-foreground">
                {daysCount} day{daysCount !== 1 ? 's' : ''} · Manage schedule
              </p>
            </div>
          </Card>
        </Link>
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
