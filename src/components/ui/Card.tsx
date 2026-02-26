import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ hoverable, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl p-4',
        hoverable && 'hover:border-primary/20 transition-colors cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
