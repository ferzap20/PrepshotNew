import { useMatches } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/enums';

export function DebugFileBadge() {
  const { session } = useAuth();
  const matches = useMatches();

  if (session?.role !== UserRole.Admin) return null;

  const handle = matches
    .slice()
    .reverse()
    .find((m) => (m.handle as { filename?: string } | null)?.filename)
    ?.handle as { filename: string } | undefined;

  if (!handle?.filename) return null;

  return (
    <span className="inline-flex items-center self-center px-2 py-0.5 rounded text-xs font-mono bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border border-yellow-400/40 select-none shrink-0">
      {handle.filename}
    </span>
  );
}
