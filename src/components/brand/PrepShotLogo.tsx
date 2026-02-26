import { cn } from '@/lib/utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = { sm: 28, md: 36, lg: 48 };

export function PrepShotLogo({ size = 'md', showText = true, className }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={s}
        height={s}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer ring */}
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground" />
        {/* Middle ring */}
        <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/60" />
        {/* Iris blades (6) */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <path
            key={angle}
            d={`M24,24 L${24 + 14 * Math.cos(((angle - 15) * Math.PI) / 180)},${24 + 14 * Math.sin(((angle - 15) * Math.PI) / 180)} A14,14 0 0,1 ${24 + 14 * Math.cos(((angle + 15) * Math.PI) / 180)},${24 + 14 * Math.sin(((angle + 15) * Math.PI) / 180)} Z`}
            className="text-primary"
            fill="currentColor"
            opacity="0.8"
          />
        ))}
        {/* Inner ring */}
        <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="1" className="text-foreground" />
        {/* Center dot */}
        <circle cx="24" cy="24" r="3" className="text-primary" fill="currentColor" />
      </svg>
      {showText && (
        <span className="text-lg font-medium tracking-tight">
          <span className="text-foreground">Prep</span>
          <span className="text-primary">Shot</span>
        </span>
      )}
    </div>
  );
}
