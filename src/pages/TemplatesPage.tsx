import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { Plus, BookOpen, ChevronDown, ChevronRight, Trash2, Search, FolderOpen, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import {
  packageTemplatesRepo,
  templateItemsRepo,
  catalogItemsRepo,
  projectsRepo,
  projectGeneralListsRepo,
} from '@/lib/db/repositories';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils/cn';
import type { PackageTemplate, TemplateItem, CatalogItem, Project } from '@/types/models';

export function TemplatesPage() {
  const { session } = useAuth();

  const [templates, setTemplates] = useState<PackageTemplate[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [templateItemsMap, setTemplateItemsMap] = useState<Map<string, TemplateItem[]>>(new Map());

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [applyingTemplate, setApplyingTemplate] = useState<PackageTemplate | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCount, setAppliedCount] = useState<number | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  useEffect(() => { load(); }, [session?.userId]);

  const catalogMap = useMemo(() => new Map(catalogItems.map((c) => [c.id, c])), [catalogItems]);

  const reloadTemplateItems = async (templateId: string) => {
    const items = await templateItemsRepo.getByTemplateId(templateId);
    setTemplateItemsMap((prev) => new Map(prev).set(templateId, items));
  };

  const handleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setAddSearch('');
    } else {
      setExpandedId(id);
      setAddSearch('');
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!session || !newName.trim()) return;
    await packageTemplatesRepo.create({
      userId: session.userId,
      name: newName.trim(),
      description: newDesc.trim(),
    });
    setNewName('');
    setNewDesc('');
    setIsCreateOpen(false);
    await load();
  };

  const handleDelete = async (templateId: string) => {
    const items = templateItemsMap.get(templateId) ?? [];
    await Promise.all(items.map((item) => templateItemsRepo.remove(item.id)));
    await packageTemplatesRepo.remove(templateId);
    setDeletingId(null);
    if (expandedId === templateId) setExpandedId(null);
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

  const handleAddItem = async (catalogItem: CatalogItem) => {
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

  const handleRemoveItem = async (itemId: string) => {
    if (!expandedId) return;
    await templateItemsRepo.remove(itemId);
    await reloadTemplateItems(expandedId);
  };

  const openApply = async (template: PackageTemplate) => {
    if (!session) return;
    const projs = await projectsRepo.getByUserId(session.userId);
    projs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    setProjects(projs);
    setSelectedProjectId(projs[0]?.id ?? '');
    setAppliedCount(null);
    setApplyingTemplate(template);
  };

  const handleApply = async () => {
    if (!applyingTemplate || !selectedProjectId || !session) return;
    setIsApplying(true);
    const items = templateItemsMap.get(applyingTemplate.id) ?? [];
    const existing = await projectGeneralListsRepo.getByProjectId(selectedProjectId);
    const existingIds = new Set(existing.map((e) => e.catalogItemId));
    const toAdd = items.filter((item) => !existingIds.has(item.catalogItemId));
    await Promise.all(
      toAdd.map((item) =>
        projectGeneralListsRepo.create({
          projectId: selectedProjectId,
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
    setAppliedCount(toAdd.length);
    setIsApplying(false);
  };

  const filteredCatalog = useMemo(() => {
    if (!expandedId) return [];
    const q = addSearch.toLowerCase().trim();
    const existingIds = new Set((templateItemsMap.get(expandedId) ?? []).map((i) => i.catalogItemId));
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-secondary rounded animate-pulse" />
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-secondary animate-pulse" />
        ))}
      </div>
    );
  }

  const deletingTemplate = templates.find((t) => t.id === deletingId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Templates</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={32} />}
          title="No templates yet"
          description="Create a gear package template to reuse across projects."
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus size={16} />
              New Template
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {templates.map((template) => {
            const isExpanded = expandedId === template.id;
            const items = templateItemsMap.get(template.id) ?? [];

            return (
              <Card key={template.id} className="overflow-hidden">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleExpand(template.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    {isExpanded ? (
                      <ChevronDown size={16} className="flex-shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight size={16} className="flex-shrink-0 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{template.name}</p>
                      {template.description && (
                        <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 mr-2">
                      {items.length} item{items.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openApply(template)}
                      className="px-2 py-1 text-xs rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => setDeletingId(template.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4">
                    {items.length > 0 ? (
                      <div className="space-y-0.5">
                        {items.map((item) => {
                          const cat = catalogMap.get(item.catalogItemId);
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-secondary/50"
                            >
                              <div className="flex-1 min-w-0">
                                <span className="text-sm">{cat?.name ?? 'Unknown item'}</span>
                                {cat?.brand && (
                                  <span className="text-xs text-muted-foreground ml-2">{cat.brand}</span>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No items. Search below to add.</p>
                    )}

                    <div className="space-y-2">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Add from Catalog
                      </p>
                      <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={addSearch}
                          onChange={(e) => setAddSearch(e.target.value)}
                          placeholder="Search catalog…"
                          className="w-full pl-8 pr-3 py-1.5 text-sm bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                        />
                      </div>
                      {addSearch && (
                        <div className="space-y-0.5">
                          {filteredCatalog.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-2 text-center">No results</p>
                          ) : (
                            filteredCatalog.map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => handleAddItem(cat)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                              >
                                <Plus size={13} className="text-muted-foreground flex-shrink-0" />
                                <span className="text-sm flex-1 min-w-0">{cat.name}</span>
                                {cat.brand && (
                                  <span className="text-xs text-muted-foreground">{cat.brand}</span>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Template">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Template Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Camera B Package"
            required
            autoFocus
          />
          <Textarea
            label="Description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Optional description…"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!newName.trim()}>
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {/* Apply Modal */}
      {applyingTemplate && (
        <Modal
          isOpen={true}
          onClose={() => setApplyingTemplate(null)}
          title={`Apply "${applyingTemplate.name}"`}
        >
          <div className="space-y-4">
            {appliedCount !== null ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Check size={24} className="text-primary" />
                </div>
                <p className="font-medium">
                  {appliedCount} item{appliedCount !== 1 ? 's' : ''} added
                </p>
                <p className="text-sm text-muted-foreground">
                  {appliedCount === 0
                    ? 'All items were already in the project gear list.'
                    : 'Items have been added to the project gear list.'}
                </p>
                <Button onClick={() => setApplyingTemplate(null)}>Done</Button>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-4 space-y-2">
                <FolderOpen size={32} className="mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No projects found. Create a project first.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Select a project to apply this template to:
                  </p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProjectId(p.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors',
                          selectedProjectId === p.id
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-secondary',
                        )}
                      >
                        <FolderOpen size={14} className="flex-shrink-0" />
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setApplyingTemplate(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApply}
                    disabled={!selectedProjectId || isApplying}
                  >
                    {isApplying ? 'Applying…' : 'Apply Template'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deletingTemplate && (
        <Modal isOpen={true} onClose={() => setDeletingId(null)} title="Delete Template">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Delete <strong className="text-foreground">{deletingTemplate.name}</strong>?
              This will remove all items in this template and cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeletingId(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleDelete(deletingTemplate.id)}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
