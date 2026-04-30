import { useState, useEffect, useRef } from 'react';
import { X, Trash2, Send } from 'lucide-react';
import { listItemCommentsRepo } from '@/lib/db/repositories';
import { useAuth } from '@/hooks/useAuth';
import type { ListItemComment, User } from '@/types/models';

interface Props {
  projectId: string;
  itemId: string;
  itemName: string;
  allUsers: User[];
  onClose: () => void;
  onCommentSent?: (itemId: string) => void;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function ListItemCommentModal({ projectId, itemId, itemName, allUsers, onClose, onCommentSent }: Props) {
  const { session } = useAuth();
  const [comments, setComments] = useState<ListItemComment[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  const load = async () => {
    const data = await listItemCommentsRepo.getByItemId(projectId, itemId);
    data.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    setComments(data);
  };

  useEffect(() => { load(); }, [itemId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const comment = await listItemCommentsRepo.create(projectId, itemId, text.trim());
      setText('');
      setComments((prev) => [...prev, comment]);
      onCommentSent?.(itemId);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    await listItemCommentsRepo.remove(projectId, itemId, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleDeleteAll = async () => {
    await listItemCommentsRepo.removeAll(projectId, itemId);
    setComments([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl border border-border shadow-xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Comments</p>
            <p className="text-sm font-medium truncate">{itemName}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {comments.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-muted"
                title="Delete all comments"
              >
                <Trash2 size={12} />
                Clear all
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {comments.length === 0 ? (
            <p className="text-sm italic text-muted-foreground text-center py-8">No comments yet. Be the first!</p>
          ) : (
            comments.map((comment) => {
              const author = userMap.get(comment.userId);
              const isMe = comment.userId === session?.userId;
              const authorName = author?.name || author?.email?.split('@')[0] || 'Unknown';
              return (
                <div key={comment.id} className={`flex gap-2 group ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex flex-col max-w-[80%] gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && (
                      <span className="text-xs text-muted-foreground px-1">{authorName}</span>
                    )}
                    <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                      {comment.text}
                    </div>
                    <span className="text-[10px] text-muted-foreground px-1">{formatTime(comment.createdAt)}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="opacity-0 group-hover:opacity-100 self-center p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-all flex-shrink-0"
                    aria-label="Delete message"
                  >
                    <X size={11} />
                  </button>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 px-4 py-3 border-t border-border flex-shrink-0">
          <input
            autoFocus
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Add a comment…"
            className="flex-1 rounded-xl border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <Send size={15} />
          </button>
        </div>

      </div>
    </div>
  );
}
