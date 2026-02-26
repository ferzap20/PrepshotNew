import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-primary/15 text-primary border-primary/20',
  success: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-500 border-amber-500/20',
  danger: 'bg-destructive/15 text-destructive border-destructive/20',
  info: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'text-xs px-2 py-0.5 rounded-full border inline-flex items-center',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
