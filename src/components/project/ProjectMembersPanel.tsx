import { useState, useEffect, useMemo } from 'react';
import { Users, X, UserPlus, Mail, Clock, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { projectMembersRepo, projectInvitationsRepo, usersRepo } from '@/lib/db/repositories';
import type { ProjectMember, ProjectInvitation, User } from '@/types/models';

interface LookupUser {
  id: string;
  email: string;
  name?: string | null;
  createdAt: string;
}

type LookupState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; user: LookupUser }
  | { status: 'alreadyMember'; user: LookupUser }
  | { status: 'notFound'; email: string };

interface Props {
  projectId: string;
  members: ProjectMember[];
  allUsers: User[];
  currentUserId: string;
  onMembersChanged: () => void;
}

function memberSince(iso: string) {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function ProjectMembersPanel({ projectId, members, allUsers, currentUserId, onMembersChanged }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [lookup, setLookup] = useState<LookupState>({ status: 'idle' });
  const [adding, setAdding] = useState(false);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const userMap = useMemo(() => new Map(allUsers.map((u) => [u.id, u])), [allUsers]);
  const memberUserIds = useMemo(() => new Set(members.map((m) => m.userId)), [members]);

  useEffect(() => {
    projectInvitationsRepo.getByProjectId(projectId).then(setInvitations);
  }, [projectId]);

  const refreshInvitations = () =>
    projectInvitationsRepo.getByProjectId(projectId).then(setInvitations);

  const handleLookup = async () => {
    const q = email.trim().toLowerCase();
    if (!q) return;
    setLookup({ status: 'loading' });
    const user = await usersRepo.lookupByEmail(q);
    if (!user) {
      setLookup({ status: 'notFound', email: q });
    } else if (memberUserIds.has(user.id)) {
      setLookup({ status: 'alreadyMember', user });
    } else {
      setLookup({ status: 'found', user });
    }
  };

  const handleAdd = async (user: LookupUser) => {
    setAdding(true);
    await projectMembersRepo.create({ projectId, userId: user.id, crewType: '', role: '', isOwner: false });
    setAdding(false);
    setEmail('');
    setLookup({ status: 'idle' });
    setShowAdd(false);
    onMembersChanged();
  };

  const handleInvite = async (inviteEmail: string) => {
    setAdding(true);
    await projectInvitationsRepo.create(projectId, inviteEmail);
    setAdding(false);
    setEmail('');
    setLookup({ status: 'idle' });
    setShowAdd(false);
    await refreshInvitations();
  };

  const handleRemoveMember = async (member: ProjectMember) => {
    await projectMembersRepo.remove(member.id);
    onMembersChanged();
  };

  const handleRevokeInvite = async (inv: ProjectInvitation) => {
    await projectInvitationsRepo.remove(projectId, inv.id);
    await refreshInvitations();
  };

  return (
    <div className="space-y-4">
      {/* Header — always visible */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <Users size={15} className="text-muted-foreground" />
          <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Team</span>
          {members.length > 0 && (
            <span className="text-xs text-muted-foreground">({members.length})</span>
          )}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setShowAdd((v) => !v); setEmail(''); setLookup({ status: 'idle' }); if (!isExpanded) setIsExpanded(true); }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <UserPlus size={13} />
            Add
          </button>
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <ChevronDown size={15} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <>

      {/* Add member form */}
      {showAdd && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              autoFocus
              type="email"
              placeholder="Email address…"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setLookup({ status: 'idle' }); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              className="flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleLookup}
              disabled={!email.trim() || lookup.status === 'loading'}
              className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              Find
            </button>
          </div>

          {/* Lookup result */}
          {lookup.status === 'loading' && (
            <p className="text-xs text-muted-foreground px-1">Searching…</p>
          )}

          {lookup.status === 'found' && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{lookup.user.name || lookup.user.email}</p>
                {lookup.user.name && <p className="text-xs text-muted-foreground">{lookup.user.email}</p>}
                <p className="text-xs text-muted-foreground mt-0.5">Member since {memberSince(lookup.user.createdAt)}</p>
              </div>
              <button
                onClick={() => handleAdd(lookup.user)}
                disabled={adding}
                className="flex-shrink-0 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                Add to Team
              </button>
            </div>
          )}

          {lookup.status === 'alreadyMember' && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-sm font-medium">{lookup.user.name || lookup.user.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Already a team member</p>
            </div>
          )}

          {lookup.status === 'notFound' && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm">No account found for</p>
                <p className="text-sm font-medium truncate">{lookup.email}</p>
              </div>
              <button
                onClick={() => handleInvite(lookup.email)}
                disabled={adding || invitations.some((i) => i.email === lookup.email)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium disabled:opacity-50 hover:bg-muted transition-colors"
              >
                <Mail size={12} />
                {invitations.some((i) => i.email === (lookup as { email: string }).email)
                  ? 'Invited'
                  : 'Send Invitation'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Members list */}
      {members.length === 0 && invitations.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">No team members yet.</p>
      ) : (
        <ul className="space-y-2">
          {members.map((member) => {
            const user = userMap.get(member.userId);
            const isMe = member.userId === currentUserId;
            return (
              <li key={member.id} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-medium truncate">{user?.name || user?.email || '—'}</span>
                    {isMe && <Badge variant="info">You</Badge>}
                    {member.isOwner && <Badge variant="default">Owner</Badge>}
                  </div>
                  {user?.name && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
                </div>
                {!member.isOwner && (
                  <button
                    onClick={() => handleRemoveMember(member)}
                    className="flex-shrink-0 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                    aria-label="Remove"
                  >
                    <X size={13} />
                  </button>
                )}
              </li>
            );
          })}

          {/* Pending invitations */}
          {invitations.map((inv) => (
            <li key={inv.id} className="flex items-center gap-2 opacity-60">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{inv.email}</span>
                  <Badge variant="default">Invited</Badge>
                </div>
              </div>
              <button
                onClick={() => handleRevokeInvite(inv)}
                className="flex-shrink-0 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                aria-label="Revoke"
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

        </>
      )}
    </div>
  );
}
