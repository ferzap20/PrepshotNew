import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2, CalendarDays } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { projectsRepo, shootingDaysRepo } from '@/lib/db/repositories';
import { useAppSetting } from '@/hooks/useAppSetting';
import { formatDateCustom } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import type { Project, ShootingDay } from '@/types/models';
import { DebugFileBadge } from '@/components/debug/DebugFileBadge';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// Returns ISO date strings (YYYY-MM-DD) for each cell; null = padding
function buildCalendarCells(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0
  const cells: (string | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
  return cells;
}

function isInRange(date: string, start: string | null, end: string | null) {
  if (!start) return true;
  if (date < start) return false;
  if (end && date > end) return false;
  return true;
}

export function ShootingDaysPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dateFormat = useAppSetting('date_format', 'DD/MM/YYYY');

  const [project, setProject] = useState<Project | null>(null);
  const [days, setDays] = useState<ShootingDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  const load = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    const [proj, shootingDays] = await Promise.all([
      projectsRepo.getById(projectId),
      shootingDaysRepo.getByProjectId(projectId),
    ]);
    setProject(proj ?? null);
    setDays(shootingDays.sort((a, b) => a.date.localeCompare(b.date)));
    if (proj?.startDate) {
      const d = new Date(proj.startDate);
      setCalYear(d.getFullYear());
      setCalMonth(d.getMonth());
    }
    setIsLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const daysByDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);

  const cells = useMemo(() => buildCalendarCells(calYear, calMonth), [calYear, calMonth]);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  };

  const handleDayClick = async (dateStr: string) => {
    if (!projectId) return;
    const existing = daysByDate.get(dateStr);
    if (existing) {
      navigate(`/projects/${projectId}/days/${existing.id}`);
    } else {
      const newDay = await shootingDaysRepo.create({ projectId, date: dateStr, notes: '' });
      navigate(`/projects/${projectId}/days/${newDay.id}`);
    }
  };

  const handleDelete = async (dayId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await shootingDaysRepo.remove(dayId);
    setDays((prev) => prev.filter((d) => d.id !== dayId));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          to={`/projects/${projectId}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          {project?.name ?? 'Project'}
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1>Shooting Days</h1>
            <DebugFileBadge />
          </div>
          <span className="text-sm text-muted-foreground">{days.length} day{days.length !== 1 ? 's' : ''}</span>
        </div>
        {project?.startDate && (
          <p className="text-xs text-muted-foreground">
            {formatDateCustom(project.startDate, dateFormat)}
            {project.endDate ? ` – ${formatDateCustom(project.endDate, dateFormat)}` : ''}
          </p>
        )}
      </div>

      {/* Calendar */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium">{MONTH_NAMES[calMonth]} {calYear}</span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-xs text-muted-foreground py-1">{d}</div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((dateStr, i) => {
            if (!dateStr) return <div key={`pad-${i}`} />;
            const inRange = isInRange(dateStr, project?.startDate ?? null, project?.endDate ?? null);
            const hasDay = daysByDate.has(dateStr);
            const today = new Date().toISOString().slice(0, 10);
            const isToday = dateStr === today;
            return (
              <button
                key={dateStr}
                onClick={() => inRange && handleDayClick(dateStr)}
                disabled={!inRange}
                className={cn(
                  'relative flex flex-col items-center justify-center h-9 rounded-lg text-sm transition-colors',
                  inRange ? 'hover:bg-muted cursor-pointer' : 'cursor-default opacity-30',
                  isToday && 'ring-1 ring-primary',
                  hasDay && inRange && 'bg-primary/10 text-primary font-medium',
                )}
              >
                {dateStr.slice(8)}
                {hasDay && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          Click a date to add or view a shooting day
        </p>
      </Card>

      {/* List */}
      {days.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={32} />}
          title="No shooting days yet"
          description="Click a date on the calendar to add a shooting day."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {days.map((day) => (
            <Card
              key={day.id}
              hoverable
              onClick={() => navigate(`/projects/${projectId}/days/${day.id}`)}
              className="flex items-center gap-4 cursor-pointer py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{formatDateCustom(day.date, dateFormat)}</p>
                {day.notes && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{day.notes}</p>
                )}
              </div>
              <button
                onClick={(e) => handleDelete(day.id, e)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
