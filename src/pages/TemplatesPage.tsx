import { useState, type FormEvent } from 'react';
import { Plus, BookOpen, ChevronDown, ChevronRight, Trash2, Search, FolderOpen, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { projectsRepo } from '@/lib/db/repositories';
import { useAuth } from '@/hooks/useAuth';
import { useTemplateManager } from '@/hooks/useTemplateManager';
import { DebugFileBadge } from '@/components/debug/DebugFileBadge';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils/cn';
import type { PackageTemplate, Project } from '@/types/models';

export function TemplatesPage() {
  const { session } = useAuth();
  const { addToast } = useToast();

  const {
    templates,
    catalogMap,
    isLoading,
    expandedId,
    templateItemsMap,
    addSearch,
    setAddSearch,
    filteredCatalog,
    expand,
    createTemplate,
    deleteTemplate,
    addItem,
    removeItem,
    applyToProject,
  } = useTemplateManager();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [applyingTemplate, setApplyingTemplate] = useState<PackageTemplate | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCount, setAppliedCount] = useState<number | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await createTemplate(newName, newDesc);
    setNewName('');
    setNewDesc('');
    setIsCreateOpen(false);
  };

  const handleDelete = async (templateId: string) => {
    await deleteTemplate(templateId);
    setDeletingId(null);
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
    if (!applyingTemplate || !selectedProjectId) return;
    setIsApplying(true);
    const count = await applyToProject(applyingTemplate.id, selectedProjectId);
    setAppliedCount(count);
    setIsApplying(false);
    if (count > 0) {
      addToast(`${count} item${count !== 1 ? 's' : ''} added from template`, 'success');
    }
  };

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
        <div className="flex items-center gap-2">
          <h1>Templates</h1>
          <DebugFileBadge />
        </div>
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
                    onClick={() => expand(template.id)}
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
                        <p className="text-xs text-muted-foreground truncate">
                          {template.description}
                        </p>
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
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {cat.brand}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                              <button
                                onClick={() => removeItem(item.id)}
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
                        <Search
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
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
                            <p className="text-xs text-muted-foreground py-2 text-center">
                              No results
                            </p>
                          ) : (
                            filteredCatalog.map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => addItem(cat)}
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
                  <Button onClick={handleApply} disabled={!selectedProjectId || isApplying}>
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
              Delete <strong className="text-foreground">{deletingTemplate.name}</strong>? This will
              remove all items in this template and cannot be undone.
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
