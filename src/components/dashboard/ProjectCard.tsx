import { Link } from 'react-router';
import { Package, Calendar, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatShortDate } from '@/lib/utils/date';
import type { Project } from '@/types/models';

interface ProjectCardProps {
  project: Project;
  equipmentCount: number;
}

export function ProjectCard({ project, equipmentCount }: ProjectCardProps) {
  const dateRange =
    project.startDate && project.endDate
      ? `${formatShortDate(project.startDate)} – ${formatShortDate(project.endDate)}`
      : project.startDate
        ? `From ${formatShortDate(project.startDate)}`
        : 'No dates set';

  return (
    <Link to={`/projects/${project.id}`}>
      <Card hoverable className="flex flex-col gap-3 h-full">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate">{project.name}</h3>
          <ChevronRight size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {project.crewType && (
            <Badge variant="info">{project.crewType}</Badge>
          )}
          {(project.productionCompany || project.role) && (
            <Badge variant="default">{project.productionCompany || project.role}</Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {dateRange}
          </span>
          <span className="flex items-center gap-1">
            <Package size={12} />
            {equipmentCount} item{equipmentCount !== 1 ? 's' : ''}
          </span>
        </div>
      </Card>
    </Link>
  );
}
