import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Pencil, Copy, Trash2, Package, Calendar, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { DuplicateProjectModal } from '@/components/projects/DuplicateProjectModal';
import { DebugFileBadge } from '@/components/debug/DebugFileBadge';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';
import { ProjectGearListPreview } from '@/components/project/ProjectGearListPreview';
import { ExportMenu } from '@/components/project/ExportMenu';
import { ProjectMembersPanel } from '@/components/project/ProjectMembersPanel';
import { projectsRepo, projectGeneralListsRepo, catalogItemsRepo, usersRepo, projectMembersRepo } from '@/lib/db/repositories';
import { formatDateCustom } from '@/lib/utils/date';
import { useAppSetting } from '@/hooks/useAppSetting';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Project, ProjectGeneralListItem, CatalogItem, User, ProjectMember } from '@/types/models';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { addToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [listItems, setListItems] = useState<ProjectGeneralListItem[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [listUsers, setListUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!projectId) return;
    const m = await projectMembersRepo.getByProjectId(projectId);
    setMembers(m);
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      setIsLoading(true);
      const p = await projectsRepo.getById(projectId);
      if (!p) { navigate('/projects', { replace: true }); return; }
      setProject(p);
      const [items, catalog, users, m] = await Promise.all([
        projectGeneralListsRepo.getByProjectId(projectId),
        catalogItemsRepo.getAll(),
        usersRepo.getAll(),
        projectMembersRepo.getByProjectId(projectId),
      ]);
      setListItems(items);
      setCatalogItems(catalog);
      setListUsers(users);
      setMembers(m);
      setIsLoading(false);
    };
    load();
  }, [projectId, navigate]);

  const dateFormat = useAppSetting('date_format', 'DD/MM/YYYY');

  const catalogMap = new Map(catalogItems.map((c) => [c.id, c]));

  const isPublished = listItems.length > 0 && listItems.every((i) => i.published);

  const exportCSV = () => {
    const header = ['Name', 'Brand', 'Category', 'Quantity', 'Required', 'Notes'];
    const rows = listItems.map((item) => {
      const cat = catalogMap.get(item.catalogItemId);
      return [
        cat?.name ?? '',
        cat?.brand ?? '',
        cat?.category ?? '',
        String(item.quantity),
        item.isRequired ? 'Yes' : 'No',
        item.notes,
      ];
    });
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((r) => r.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name ?? 'gear-list'}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const togglePublish = async () => {
    const newVal = !isPublished;
    await Promise.all(
      listItems.map((item) => projectGeneralListsRepo.update(item.id, { published: newVal })),
    );
    setListItems((prev) => prev.map((item) => ({ ...item, published: newVal })));
    addToast(newVal ? 'Gear list published' : 'Gear list unpublished', 'success');
  };

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
      {/* Back */}
      <Link
        to="/projects"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Projects
      </Link>

      {/* Project header */}
      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 relative">
            <h1>{project.name}</h1>
            <DebugFileBadge />
            <div className="relative ml-auto">
              <button
                onClick={(e) => { e.preventDefault(); setMenuOpen((v) => !v); }}
                className="p-1.5 rounded-lg text-prepshot-sage bg-accent/15 hover:bg-accent/25 transition-colors"
                aria-label="Actions"
              >
                <MoreVertical size={16} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 z-20 min-w-[140px] rounded-lg border border-border bg-background shadow-lg py-1">
                    <button
                      onClick={() => { setMenuOpen(false); setIsEditOpen(true); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                    >
                      <Pencil size={14} />
                      Project info
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); setIsDuplicateOpen(true); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                    >
                      <Copy size={14} />
                      Duplicate
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); setIsDeleteOpen(true); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors text-left text-destructive"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
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

      {/* Team Members */}
      <Card>
        <ProjectMembersPanel
          projectId={project.id}
          members={members}
          allUsers={listUsers}
          currentUserId={session?.userId ?? ''}
          onChanged={loadMembers}
        />
      </Card>

      {/* Gear list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Gear List</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm" onClick={() => navigate(`/projects/${project.id}/list`)} disabled={listItems.length === 0}>
              Edit Gear List
            </Button>
            {listItems.length > 0 && (
              <ExportMenu
                projectId={project.id}
                project={project}
                items={listItems}
                catalogItems={catalogItems}
                onExportCSV={exportCSV}
                onTogglePublish={togglePublish}
                isPublished={isPublished}
              />
            )}
          </div>
        </div>
        <Card>
          <ProjectGearListPreview
            items={listItems}
            catalogItems={catalogItems}
            users={listUsers}
            onCreateList={() => navigate(`/projects/${project.id}/list`)}
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
