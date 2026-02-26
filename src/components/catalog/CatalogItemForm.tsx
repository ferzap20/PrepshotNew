import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { CatalogCategory } from '@/types/enums';
import type { CatalogItem } from '@/types/models';

const CATEGORY_OPTIONS = Object.values(CatalogCategory).map((c) => ({ value: c, label: c }));

interface CatalogItemFormProps {
  initial?: Partial<CatalogItem>;
  onSubmit: (data: Omit<CatalogItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

export function CatalogItemForm({ initial, onSubmit, onCancel, submitLabel }: CatalogItemFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [brand, setBrand] = useState(initial?.brand ?? '');
  const [category, setCategory] = useState<CatalogCategory>(initial?.category ?? CatalogCategory.Camera);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [aliases, setAliases] = useState((initial?.aliases ?? []).join(', '));
  const [compatibilityNotes, setCompatibilityNotes] = useState(initial?.compatibilityNotes ?? '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        brand: brand.trim(),
        category,
        description: description.trim(),
        aliases: aliases.split(',').map((a) => a.trim()).filter(Boolean),
        compatibilityNotes: compatibilityNotes.trim(),
        imageUrl: initial?.imageUrl ?? null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ARRI ALEXA 35" required />
        <Input label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. ARRI" />
      </div>
      <Select
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value as CatalogCategory)}
        options={CATEGORY_OPTIONS}
      />
      <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the item" />
      <Input
        label="Aliases (comma-separated)"
        value={aliases}
        onChange={(e) => setAliases(e.target.value)}
        placeholder="e.g. ALEXA35, Alexa 35"
      />
      <Textarea label="Compatibility Notes" value={compatibilityNotes} onChange={(e) => setCompatibilityNotes(e.target.value)} placeholder="Compatible accessories, mounts, etc." />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? `${submitLabel}...` : submitLabel}
        </Button>
      </div>
    </form>
  );
}
