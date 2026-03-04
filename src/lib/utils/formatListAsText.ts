import type { ProjectGeneralListItem, CatalogItem, Project } from '@/types/models';

interface FormatOptions {
  showProjectName?: boolean;
  showProductionCompany?: boolean;
  showDates?: boolean;
  showNotes?: boolean;
  showQuantity?: boolean;
  showBrand?: boolean;
}

function groupByCategory(
  items: ProjectGeneralListItem[],
  catalogMap: Map<string, CatalogItem>,
): { category: string; rows: { item: ProjectGeneralListItem; cat: CatalogItem }[] }[] {
  const map = new Map<string, { item: ProjectGeneralListItem; cat: CatalogItem }[]>();
  for (const item of items) {
    const cat = catalogMap.get(item.catalogItemId);
    if (!cat) continue;
    const label = cat.category as string;
    const existing = map.get(label) ?? [];
    existing.push({ item, cat });
    map.set(label, existing);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, rows]) => ({ category, rows }));
}

export function formatListAsText(
  items: ProjectGeneralListItem[],
  catalogItems: CatalogItem[],
  project?: Project | null,
  opts: FormatOptions = {},
): string {
  const {
    showProjectName = true,
    showProductionCompany = true,
    showDates = true,
    showNotes = false,
    showQuantity = true,
    showBrand = true,
  } = opts;

  const catalogMap = new Map(catalogItems.map((c) => [c.id, c]));
  const lines: string[] = [];

  if (project) {
    if (showProjectName) lines.push(project.name);
    if (showProductionCompany && project.productionCompany) {
      lines.push(project.productionCompany);
    }
    if (showDates && project.startDate) {
      const range = project.endDate
        ? `${project.startDate} – ${project.endDate}`
        : `From ${project.startDate}`;
      lines.push(range);
    }
    if (showNotes && project.notes) lines.push(project.notes);
    if (lines.length > 0) lines.push('');
  }

  const groups = groupByCategory(items, catalogMap);
  for (const { category, rows } of groups) {
    lines.push(`${category.toUpperCase()}`);
    for (const { item, cat } of rows) {
      const brand = showBrand && cat.brand ? ` (${cat.brand})` : '';
      const qty = showQuantity ? ` ×${item.quantity}` : '';
      const note = showNotes && item.notes ? ` — ${item.notes}` : '';
      lines.push(`- ${cat.name}${brand}${qty}${note}`);
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}
