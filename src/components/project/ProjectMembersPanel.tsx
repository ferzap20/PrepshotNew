import { useState, useMemo } from 'react';
import { UserPlus, X, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { projectMembersRepo } from '@/lib/db/repositories';
import type { ProjectMember, User } from '@/types/models';

interface Props {
  projectId: string;
  members: ProjectMember[];
  allUsers: User[];
  currentUserId: string;
  onChanged: () => void;
}

export function ProjectMembersPanel({ projectId, members, allUsers, currentUserId, onChanged }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState<string | null>(null);

  const memberUserIds = useMemo(() => new Set(members.map((m) => m.userId)), [members]);

  const userMap = useMemo(() => new Map(allUsers.map((u) => [u.id, u])), [allUsers]);

  const suggestions = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allUsers.filter((u) => {
      if (memberUserIds.has(u.id)) return false;
      if (!q) return true;
      return (
        u.email.toLowerCase().includes(q) ||
        (u.name ?? '').toLowerCase().includes(q)
      );
    }).slice(0, 8);
  }, [allUsers, memberUserIds, search]);

  const handleAdd = async (user: User) => {
    setAdding(user.id);
    await projectMembersRepo.create({
      projectId,
      userId: user.id,
      crewType: '',
      role: '',
      isOwner: false,
    });
    setAdding(null);
    setSearch('');
    setShowAdd(false);
    onChanged();
  };

  const handleRemove = async (member: ProjectMember) => {
    await projectMembersRepo.remove(member.id);
    onChanged();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Team</h2>
        </div>
        <button
          onClick={() => { setShowAdd((v) => !v); setSearch(''); }}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <UserPlus size={14} />
          Add member
        </button>
      </div>

      {showAdd && (
        <div className="rounded-lg border border-border bg-background p-3 space-y-2">
          <input
            autoFocus
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {suggestions.length === 0 ? (
            <p className="text-xs text-muted-foreground px-1">
              {search ? 'No users found.' : 'All registered users are already members.'}
            </p>
          ) : (
            <ul className="space-y-0.5">
              {suggestions.map((user) => (
                <li key={user.id}>
                  <button
                    disabled={adding === user.id}
                    onClick={() => handleAdd(user)}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted transition-colors text-left disabled:opacity-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                      {user.name && (
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      )}
                    </div>
                    <span className="text-xs text-primary flex-shrink-0">Add</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {members.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">No team members added yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {members.map((member) => {
            const user = userMap.get(member.userId);
            const isMe = member.userId === currentUserId;
            return (
              <li key={member.id} className="flex items-center gap-3 py-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">
                      {user?.name || user?.email || member.userId}
                    </span>
                    {isMe && <Badge variant="info">You</Badge>}
                    {member.isOwner && <Badge variant="default">Owner</Badge>}
                    {member.role && <span className="text-xs text-muted-foreground">{member.role}</span>}
                  </div>
                  {user?.name && (
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  )}
                </div>
                {!member.isOwner && (
                  <button
                    onClick={() => handleRemove(member)}
                    className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors flex-shrink-0"
                    aria-label="Remove member"
                  >
                    <X size={14} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
