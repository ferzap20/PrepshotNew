import { cn } from '@/lib/utils/cn';

interface CategoryFilterPillsProps {
  categories: readonly string[];
  active: string;
  onSelect: (cat: string) => void;
  allLabel?: string;
}

export function CategoryFilterPills({
  categories,
  active,
  onSelect,
  allLabel = 'All',
}: CategoryFilterPillsProps) {
  return (
    <div className="flex gap-1.5 flex-wrap flex-shrink-0">
      <button
        onClick={() => onSelect('')}
        className={cn(
          'px-2.5 py-1 rounded-full text-xs transition-colors',
          !active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}
      >
        {allLabel}
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat === active ? '' : cat)}
          className={cn(
            'px-2.5 py-1 rounded-full text-xs transition-colors',
            active === cat
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
