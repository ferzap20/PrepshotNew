import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  projectsRepo,
  catalogItemsRepo,
  projectGeneralListsRepo,
  userGearRepo,
} from '@/lib/db/repositories';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { scoreMatch } from '@/lib/utils/fuzzy';
import { CatalogCategory } from '@/types/enums';
import type { CatalogItem, ProjectGeneralListItem, UserGearItem, Project } from '@/types/models';

const CATEGORY_ORDER = Object.values(CatalogCategory);

export function useGearList(projectId: string | undefined) {
  const { session } = useAuth();
  const { addToast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [listItems, setListItems] = useState<ProjectGeneralListItem[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [userGear, setUserGear] = useState<UserGearItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  const load = useCallback(async () => {
    if (!projectId || !session) return;
    setIsLoading(true);
    const [proj, items, catalog, gear] = await Promise.all([
      projectsRepo.getById(projectId),
      projectGeneralListsRepo.getByProjectId(projectId),
      catalogItemsRepo.getAll(),
      userGearRepo.getByUserId(session.userId),
    ]);
    setProject(proj ?? null);
    setListItems(items);
    setCatalogItems(catalog);
    setUserGear(gear);
    setIsLoading(false);
  }, [projectId, session]);

  useEffect(() => {
    load();
  }, [load]);

  const catalogMap = useMemo(() => new Map(catalogItems.map((c) => [c.id, c])), [catalogItems]);

  // Reset brand filter whenever category changes
  useEffect(() => { setBrandFilter(''); }, [categoryFilter]);

  const { brandOptions, top7BrandNames } = useMemo(() => {
    if (!categoryFilter) return { brandOptions: [] as { label: string; value: string }[], top7BrandNames: new Set<string>() };
    const inCategory = catalogItems.filter((c) => c.category === categoryFilter);
    if (inCategory.length <= 20) return { brandOptions: [] as { label: string; value: string }[], top7BrandNames: new Set<string>() };

    const counts = new Map<string, number>();
    for (const item of inCategory) {
      counts.set(item.brand, (counts.get(item.brand) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const top7 = sorted.slice(0, 7);
    const top7Names = new Set(top7.map(([b]) => b));
    const options = top7.map(([brand]) => ({ label: brand, value: brand }));
    if (sorted.length > 7) options.push({ label: 'Others', value: '__others__' });

    return { brandOptions: options, top7BrandNames: top7Names };
  }, [catalogItems, categoryFilter]);

  const addedCatalogIds = useMemo(() => new Set(listItems.map((i) => i.catalogItemId)), [listItems]);

  const addedUserGearIds = useMemo(
    () => new Set(listItems.filter((i) => i.userGearId).map((i) => i.userGearId!)),
    [listItems],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Array<{ item: ProjectGeneralListItem; cat: CatalogItem }>>();
    for (const item of listItems) {
      const cat = catalogMap.get(item.catalogItemId);
      if (!cat) continue;
      if (!map.has(cat.category)) map.set(cat.category, []);
      map.get(cat.category)!.push({ item, cat });
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((category) => ({
      category,
      rows: map.get(category)!.sort((a, b) => a.cat.name.localeCompare(b.cat.name)),
    }));
  }, [listItems, catalogMap]);

  const filteredCatalog = useMemo(() => {
    let items = catalogItems;
    if (categoryFilter) items = items.filter((c) => c.category === categoryFilter);
    if (brandFilter) {
      if (brandFilter === '__others__') {
        items = items.filter((c) => !top7BrandNames.has(c.brand));
      } else {
        items = items.filter((c) => c.brand === brandFilter);
      }
    }
    if (search.trim()) {
      return items
        .map((c) => ({ c, score: scoreMatch(search, c) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ c }) => c);
    }
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [catalogItems, search, categoryFilter, brandFilter, top7BrandNames]);

  const filteredUserGear = useMemo(() => {
    if (!search.trim()) return userGear;
    return userGear.filter((g) => {
      const cat = catalogMap.get(g.catalogItemId);
      return cat ? scoreMatch(search, cat) > 0 : false;
    });
  }, [userGear, search, catalogMap]);

  const isPublished = listItems.length > 0 && listItems.every((i) => i.published);

  const togglePublish = async () => {
    const newVal = !isPublished;
    await Promise.all(
      listItems.map((item) => projectGeneralListsRepo.update(item.id, { published: newVal })),
    );
    await load();
    addToast(newVal ? 'Gear list published' : 'Gear list unpublished', 'success');
  };

  const addFromCatalog = async (catalogItem: CatalogItem) => {
    if (!projectId || !session || addedCatalogIds.has(catalogItem.id)) return;
    await projectGeneralListsRepo.create({
      projectId,
      userId: session.userId,
      catalogItemId: catalogItem.id,
      quantity: 1,
      notes: '',
      isRequired: false,
      published: false,
      source: null,
      userGearId: null,
    });
    await load();
  };

  const addFromUserGear = async (gearItem: UserGearItem) => {
    if (!projectId || !session || addedUserGearIds.has(gearItem.id)) return;
    await projectGeneralListsRepo.create({
      projectId,
      userId: session.userId,
      catalogItemId: gearItem.catalogItemId,
      quantity: gearItem.quantity ?? 1,
      notes: '',
      isRequired: false,
      published: false,
      source: 'personal',
      userGearId: gearItem.id,
    });
    await load();
  };

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

  const deleteItem = async (itemId: string) => {
    await projectGeneralListsRepo.remove(itemId);
    setListItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  return {
    project,
    listItems,
    catalogItems,
    userGear,
    isLoading,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    brandFilter,
    setBrandFilter,
    brandOptions,
    catalogMap,
    addedCatalogIds,
    addedUserGearIds,
    grouped,
    filteredCatalog,
    filteredUserGear,
    isPublished,
    reload: load,
    addFromCatalog,
    addFromUserGear,
    exportCSV,
    deleteItem,
    togglePublish,
  };
}
