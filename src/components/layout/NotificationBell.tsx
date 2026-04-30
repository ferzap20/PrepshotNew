import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, MessageSquare, UserPlus, UserMinus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { notificationsRepo } from '@/lib/db/repositories';
import type { Notification } from '@/types/models';

const POLL_INTERVAL = 30_000;

function NotifIcon({ type }: { type: Notification['type'] }) {
  if (type === 'new_comment') return <MessageSquare size={13} className="text-primary" />;
  if (type === 'added_to_project') return <UserPlus size={13} className="text-emerald-500" />;
  return <UserMinus size={13} className="text-destructive" />;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const load = async () => {
    try {
      const data = await notificationsRepo.getAll();
      setNotifications(data);
    } catch {
      // silently ignore — user may not be logged in yet
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  const handleMarkAllRead = async () => {
    await notificationsRepo.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDismiss = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await notificationsRepo.remove(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClick = async (notif: Notification) => {
    if (!notif.read) {
      await notificationsRepo.markAllRead();
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    }
    setOpen(false);
    if (notif.projectId) {
      navigate(`/projects/${notif.projectId}`);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        title="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold px-0.5">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-80 rounded-xl border border-border bg-background shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
            <span className="text-sm font-medium">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Check size={11} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted transition-colors group ${
                    !notif.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <NotifIcon type={notif.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug ${!notif.read ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatTime(notif.createdAt)}</p>
                  </div>
                  <button
                    onClick={(e) => handleDismiss(e, notif.id)}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground transition-all"
                    aria-label="Dismiss"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
