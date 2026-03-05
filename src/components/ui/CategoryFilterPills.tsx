import { cn } from '@/lib/utils/cn';

interface CategoryFilterPillsProps {
  categories: readonly string[];
  active: string;
  onSelect: (cat: string) => void;
  allLabel?: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

export function CategoryFilterPills({
  categories,
  active,
  onSelect,
  allLabel = 'All',
  variant = 'primary',
}: CategoryFilterPillsProps) {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-prepshot-sage text-prepshot-charcoal',
  };

  const activeClass = variantClasses[variant];

  return (
    <div className="flex gap-1.5 flex-wrap flex-shrink-0">
      <button
        onClick={() => onSelect('')}
        className={cn(
          'px-2.5 py-1 rounded-full text-xs transition-colors',
          !active ? activeClass : 'bg-muted text-muted-foreground',
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
              ? activeClass
              : 'bg-muted text-muted-foreground',
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
