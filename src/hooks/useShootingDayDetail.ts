import { useState, useEffect, useMemo } from 'react';
import {
  projectsRepo,
  shootingDaysRepo,
  projectGeneralListsRepo,
  dayListModificationsRepo,
  catalogItemsRepo,
} from '@/lib/db/repositories';
import { scoreMatch } from '@/lib/utils/fuzzy';
import { CatalogCategory, ModificationType } from '@/types/enums';
import type {
  Project,
  ShootingDay,
  ProjectGeneralListItem,
  DayListModification,
  CatalogItem,
} from '@/types/models';

const CATEGORY_ORDER = Object.values(CatalogCategory);

export function useShootingDayDetail(
  projectId: string | undefined,
  dayId: string | undefined,
) {
  const [_project, setProject] = useState<Project | null>(null);
  const [day, setDay] = useState<ShootingDay | null>(null);
  const [baseItems, setBaseItems] = useState<ProjectGeneralListItem[]>([]);
  const [mods, setMods] = useState<DayListModification[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    if (!projectId || !dayId) return;
    setIsLoading(true);
    const [proj, d, items, modifications, catalog] = await Promise.all([
      projectsRepo.getById(projectId),
      shootingDaysRepo.getById(dayId),
      projectGeneralListsRepo.getByProjectId(projectId),
      dayListModificationsRepo.getByDayId(dayId),
      catalogItemsRepo.getAll(),
    ]);
    setProject(proj ?? null);
    setDay(d ?? null);
    setNotes(d?.notes ?? '');
    setBaseItems(items);
    setMods(modifications);
    setCatalogItems(catalog);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, [projectId, dayId]);

  const catalogMap = useMemo(() => new Map(catalogItems.map((c) => [c.id, c])), [catalogItems]);

  const modByCatalogId = useMemo(() => new Map(mods.map((m) => [m.catalogItemId, m])), [mods]);

  const removedIds = useMemo(
    () =>
      new Set(
        mods
          .filter((m) => m.modificationType === ModificationType.Remove)
          .map((m) => m.catalogItemId),
      ),
    [mods],
  );

  const addMods = useMemo(
    () => mods.filter((m) => m.modificationType === ModificationType.Add),
    [mods],
  );

  const effectiveGrouped = useMemo(() => {
    const map = new Map<
      string,
      Array<{
        catalogItem: CatalogItem;
        quantity: number;
        notes: string;
        isRequired: boolean;
        source?: string | null;
        badge?: string;
      }>
    >();
    for (const item of baseItems) {
      if (removedIds.has(item.catalogItemId)) continue;
      const cat = catalogMap.get(item.catalogItemId);
      if (!cat) continue;
      const mod = modByCatalogId.get(item.catalogItemId);
      const quantity =
        mod?.modificationType === ModificationType.Modify ? mod.quantity : item.quantity;
      const modNotes =
        mod?.modificationType === ModificationType.Modify ? mod.notes : item.notes;
      if (!map.has(cat.category)) map.set(cat.category, []);
      map
        .get(cat.category)!
        .push({ catalogItem: cat, quantity, notes: modNotes, isRequired: item.isRequired, source: item.source });
    }
    for (const mod of addMods) {
      const cat = catalogMap.get(mod.catalogItemId);
      if (!cat) continue;
      if (!map.has(cat.category)) map.set(cat.category, []);
      map
        .get(cat.category)!
        .push({ catalogItem: cat, quantity: mod.quantity, notes: mod.notes, isRequired: mod.isRequired, badge: 'added' });
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((category) => ({
      category,
      rows: map.get(category)!.sort((a, b) => a.catalogItem.name.localeCompare(b.catalogItem.name)),
    }));
  }, [baseItems, mods, catalogMap, removedIds, addMods, modByCatalogId]);

  const addedCatalogIds = useMemo(
    () =>
      new Set([...baseItems.map((i) => i.catalogItemId), ...addMods.map((m) => m.catalogItemId)]),
    [baseItems, addMods],
  );

  const filteredCatalog = useMemo(() => {
    let items = catalogItems.filter((c) => !addedCatalogIds.has(c.id));
    if (search.trim()) {
      return items
        .map((c) => ({ c, score: scoreMatch(search, c) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ c }) => c);
    }
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [catalogItems, addedCatalogIds, search]);

  const totalEffective = effectiveGrouped.reduce((n, g) => n + g.rows.length, 0);

  const saveNotes = async () => {
    if (!dayId) return;
    await shootingDaysRepo.update(dayId, { notes });
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const toggleRemove = async (catalogItemId: string) => {
    if (!dayId) return;
    const existing = modByCatalogId.get(catalogItemId);
    if (existing?.modificationType === ModificationType.Remove) {
      await dayListModificationsRepo.remove(existing.id);
    } else {
      if (existing) await dayListModificationsRepo.remove(existing.id);
      await dayListModificationsRepo.create({
        dayId,
        catalogItemId,
        modificationType: ModificationType.Remove,
        quantity: 0,
        notes: '',
        isRequired: false,
      });
    }
    const updated = await dayListModificationsRepo.getByDayId(dayId);
    setMods(updated);
  };

  const adjustQty = async (catalogItemId: string, newQty: number, baseQty: number) => {
    if (!dayId) return;
    const existing = modByCatalogId.get(catalogItemId);
    if (newQty === baseQty) {
      if (existing?.modificationType === ModificationType.Modify) {
        await dayListModificationsRepo.remove(existing.id);
      }
    } else {
      if (existing?.modificationType === ModificationType.Modify) {
        await dayListModificationsRepo.update(existing.id, { quantity: newQty });
      } else {
        await dayListModificationsRepo.create({
          dayId,
          catalogItemId,
          modificationType: ModificationType.Modify,
          quantity: newQty,
          notes: '',
          isRequired: false,
        });
      }
    }
    const updated = await dayListModificationsRepo.getByDayId(dayId);
    setMods(updated);
  };

  const addItem = async (catalogItem: CatalogItem) => {
    if (!dayId || addedCatalogIds.has(catalogItem.id)) return;
    await dayListModificationsRepo.create({
      dayId,
      catalogItemId: catalogItem.id,
      modificationType: ModificationType.Add,
      quantity: 1,
      notes: '',
      isRequired: false,
    });
    const updated = await dayListModificationsRepo.getByDayId(dayId);
    setMods(updated);
  };

  const removeAdd = async (modId: string) => {
    await dayListModificationsRepo.remove(modId);
    const updated = await dayListModificationsRepo.getByDayId(dayId!);
    setMods(updated);
  };

  return {
    day,
    baseItems,
    mods,
    catalogItems,
    isLoading,
    notes,
    setNotes,
    notesSaved,
    search,
    setSearch,
    catalogMap,
    modByCatalogId,
    removedIds,
    addMods,
    effectiveGrouped,
    addedCatalogIds,
    filteredCatalog,
    totalEffective,
    saveNotes,
    toggleRemove,
    adjustQty,
    addItem,
    removeAdd,
  };
}
