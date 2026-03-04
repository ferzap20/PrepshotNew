import { useState, useRef, useEffect } from 'react';
import { Share2, Printer, Copy, Mail, CheckCheck } from 'lucide-react';
import { useAppSetting } from '@/hooks/useAppSetting';
import { formatListAsText } from '@/lib/utils/formatListAsText';
import type { ProjectGeneralListItem, CatalogItem, Project } from '@/types/models';

interface Props {
  projectId: string;
  project: Project | null;
  items: ProjectGeneralListItem[];
  catalogItems: CatalogItem[];
}

export function ExportMenu({ projectId, project, items, catalogItems }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const showBrand = useAppSetting('list_layout.show_brand', 'true') === 'true';
  const showQuantity = useAppSetting('list_layout.show_quantity', 'true') === 'true';
  const showNotes = useAppSetting('list_layout.show_notes', 'false') === 'true';
  const showProjectName = useAppSetting('list_layout.show_project_name', 'true') === 'true';
  const showProductionCompany = useAppSetting('list_layout.show_production_company', 'true') === 'true';
  const showDates = useAppSetting('list_layout.show_dates', 'true') === 'true';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function getFormattedText() {
    return formatListAsText(items, catalogItems, project, {
      showProjectName,
      showProductionCompany,
      showDates,
      showNotes,
      showBrand,
      showQuantity,
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(getFormattedText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    setOpen(false);
  }

  function handleShare() {
    const text = getFormattedText();
    const title = project?.name ?? 'Gear List';
    if (navigator.share) {
      navigator.share({ title, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
    }
    setOpen(false);
  }

  function handleEmail() {
    const text = getFormattedText();
    const subject = encodeURIComponent(project?.name ?? 'Gear List');
    const body = encodeURIComponent(text);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setOpen(false);
  }

  function handlePrint() {
    window.open(`/projects/${projectId}/print`, '_blank');
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-transparent hover:border-border"
      >
        {copied ? <CheckCheck size={14} className="text-green-500" /> : <Share2 size={14} />}
        <span>{copied ? 'Copied!' : 'Share'}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border border-border bg-background shadow-lg overflow-hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left hover:bg-secondary transition-colors"
          >
            <Printer size={14} className="text-muted-foreground" />
            Print / Save PDF
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left hover:bg-secondary transition-colors"
          >
            <Copy size={14} className="text-muted-foreground" />
            Copy as text
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left hover:bg-secondary transition-colors"
          >
            <Share2 size={14} className="text-muted-foreground" />
            Send via app
          </button>
          <button
            onClick={handleEmail}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left hover:bg-secondary transition-colors"
          >
            <Mail size={14} className="text-muted-foreground" />
            Send by email
          </button>
        </div>
      )}
    </div>
  );
}
