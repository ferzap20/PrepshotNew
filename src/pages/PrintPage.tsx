import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { Printer } from 'lucide-react';
import { projectsRepo, projectGeneralListsRepo, catalogItemsRepo, usersRepo } from '@/lib/db/repositories';
import { formatDateCustom } from '@/lib/utils/date';
import { useAppSetting } from '@/hooks/useAppSetting';
import { ProjectGearListPreview } from '@/components/project/ProjectGearListPreview';
import type { Project, ProjectGeneralListItem, CatalogItem, User } from '@/types/models';

export function PrintPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [listItems, setListItems] = useState<ProjectGeneralListItem[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [listUsers, setListUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasPrinted = useRef(false);

  const dateFormat = useAppSetting('date_format', 'DD/MM/YYYY');
  const showProjectName = useAppSetting('list_layout.show_project_name', 'true') === 'true';
  const showProductionCompany = useAppSetting('list_layout.show_production_company', 'true') === 'true';
  const showDates = useAppSetting('list_layout.show_dates', 'true') === 'true';
  const showNotes = useAppSetting('list_layout.show_notes', 'false') === 'true';
  const showBrand = useAppSetting('list_layout.show_brand', 'true') === 'true';
  const showQuantity = useAppSetting('list_layout.show_quantity', 'true') === 'true';

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      const [p, items, catalog, users] = await Promise.all([
        projectsRepo.getById(projectId),
        projectGeneralListsRepo.getByProjectId(projectId),
        catalogItemsRepo.getAll(),
        usersRepo.getAll(),
      ]);
      setProject(p ?? null);
      setListItems(items);
      setCatalogItems(catalog);
      setListUsers(users);
      setIsLoading(false);
    };
    load();
  }, [projectId]);

  useEffect(() => {
    if (!isLoading && !hasPrinted.current) {
      hasPrinted.current = true;
      setTimeout(() => window.print(), 300);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Print button — hidden when printing */}
      <div className="no-print flex justify-end mb-6">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          <Printer size={16} />
          Print / Save as PDF
        </button>
      </div>

      {/* Header */}
      <div className="mb-8 space-y-1">
        {project && showProjectName && (
          <h1 className="text-2xl font-bold">{project.name}</h1>
        )}
        {project?.productionCompany && showProductionCompany && (
          <p className="text-base text-gray-600">{project.productionCompany}</p>
        )}
        {project?.startDate && showDates && (
          <p className="text-sm text-gray-500">
            {project.endDate
              ? `${formatDateCustom(project.startDate, dateFormat)} – ${formatDateCustom(project.endDate, dateFormat)}`
              : `From ${formatDateCustom(project.startDate, dateFormat)}`}
          </p>
        )}
        {project?.notes && showNotes && (
          <p className="text-sm text-gray-500 mt-2 whitespace-pre-wrap">{project.notes}</p>
        )}
      </div>

      {/* Gear list */}
      <ProjectGearListPreview
        items={listItems}
        catalogItems={catalogItems}
        users={listUsers}
        printMode
        showBrand={showBrand}
        showQuantity={showQuantity}
      />
    </div>
  );
}
