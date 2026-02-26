import { useState, useEffect, useCallback } from 'react';
import { projectsRepo } from '@/lib/db/repositories';
import { useAuth } from '@/hooks/useAuth';
import type { Project } from '@/types/models';

export function useProjects() {
  const { session } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    const data = await projectsRepo.getByUserId(session.userId);
    // Sort by most recently updated first
    data.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    setProjects(data);
    setIsLoading(false);
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { projects, isLoading, refresh };
}
