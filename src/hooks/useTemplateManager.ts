import { useState, useEffect, useMemo } from 'react';
import {
  packageTemplatesRepo,
  templateItemsRepo,
  catalogItemsRepo,
  projectGeneralListsRepo,
} from '@/lib/db/repositories';
import { useAuth } from '@/hooks/useAuth';
import type { PackageTemplate, TemplateItem, CatalogItem } from '@/types/models';

export function useTemplateManager() {
  const { session } = useAuth();

  const [templates, setTemplates] = useState<PackageTemplate[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [templateItemsMap, setTemplateItemsMap] = useState<Map<string, TemplateItem[]>>(new Map());
  const [addSearch, setAddSearch] = useState('');

  const load = async () => {
    if (!session) return;
    setIsLoading(true);
    const [tmpl, catalog, allItems] = await Promise.all([
      packageTemplatesRepo.getByUserId(session.userId),
      catalogItemsRepo.getAll(),
      templateItemsRepo.getAll(),
    ]);
    tmpl.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    catalog.sort((a, b) => a.name.localeCompare(b.name));
    setTemplates(tmpl);
    setCatalogItems(catalog);
    const map = new Map<string, TemplateItem[]>();
    for (const item of allItems) {
      const existing = map.get(item.templateId) ?? [];
      map.set(item.templateId, [...existing, item]);
    }
    setTemplateItemsMap(map);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, [session?.userId]);

  const catalogMap = useMemo(() => new Map(catalogItems.map((c) => [c.id, c])), [catalogItems]);

  const reloadTemplateItems = async (templateId: string) => {
    const items = await templateItemsRepo.getByTemplateId(templateId);
    setTemplateItemsMap((prev) => new Map(prev).set(templateId, items));
  };

  const expand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setAddSearch('');
    } else {
      setExpandedId(id);
      setAddSearch('');
    }
  };

  const createTemplate = async (name: string, description: string) => {
    if (!session) return;
    await packageTemplatesRepo.create({
      userId: session.userId,
      name: name.trim(),
      description: description.trim(),
    });
    await load();
  };

  const deleteTemplate = async (templateId: string) => {
    const items = templateItemsMap.get(templateId) ?? [];
    await Promise.all(items.map((item) => templateItemsRepo.remove(item.id)));
    await packageTemplatesRepo.remove(templateId);
    if (expandedId === templateId) setExpandedId(null);
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

  const addItem = async (catalogItem: CatalogItem) => {
    if (!expandedId) return;
    await templateItemsRepo.create({
      templateId: expandedId,
      catalogItemId: catalogItem.id,
      quantity: 1,
      notes: '',
      isRequired: false,
    });
    await reloadTemplateItems(expandedId);
    setAddSearch('');
  };

  const removeItem = async (itemId: string) => {
    if (!expandedId) return;
    await templateItemsRepo.remove(itemId);
    await reloadTemplateItems(expandedId);
  };

  const applyToProject = async (templateId: string, projectId: string): Promise<number> => {
    if (!session) return 0;
    const items = templateItemsMap.get(templateId) ?? [];
    const existing = await projectGeneralListsRepo.getByProjectId(projectId);
    const existingIds = new Set(existing.map((e) => e.catalogItemId));
    const toAdd = items.filter((item) => !existingIds.has(item.catalogItemId));
    await Promise.all(
      toAdd.map((item) =>
        projectGeneralListsRepo.create({
          projectId,
          userId: session.userId,
          catalogItemId: item.catalogItemId,
          quantity: item.quantity,
          notes: item.notes,
          isRequired: item.isRequired,
          published: false,
          source: null,
          userGearId: null,
        }),
      ),
    );
    return toAdd.length;
  };

  const filteredCatalog = useMemo(() => {
    if (!expandedId) return [];
    const q = addSearch.toLowerCase().trim();
    const existingIds = new Set(
      (templateItemsMap.get(expandedId) ?? []).map((i) => i.catalogItemId),
    );
    return catalogItems
      .filter((c) => {
        if (existingIds.has(c.id)) return false;
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          c.brand.toLowerCase().includes(q) ||
          c.aliases.some((a) => a.toLowerCase().includes(q))
        );
      })
      .slice(0, 8);
  }, [expandedId, addSearch, catalogItems, templateItemsMap]);

  return {
    templates,
    catalogItems,
    catalogMap,
    isLoading,
    expandedId,
    templateItemsMap,
    addSearch,
    setAddSearch,
    filteredCatalog,
    reload: load,
    expand,
    createTemplate,
    deleteTemplate,
    addItem,
    removeItem,
    applyToProject,
    reloadTemplateItems,
  };
}
