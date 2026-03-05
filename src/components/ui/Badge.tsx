import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:  'bg-prepshot-teal-light text-prepshot-teal-dark border-transparent',
  success:  'bg-prepshot-sage-light text-prepshot-charcoal border-transparent',
  warning:  'bg-prepshot-peach-light text-prepshot-charcoal border-transparent',
  danger:   'bg-prepshot-error-bg text-prepshot-error-text border-prepshot-error-border',
  info:     'bg-prepshot-info-bg text-prepshot-info-text border-transparent',
  outline:  'border-primary text-primary bg-transparent',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'text-xs px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
