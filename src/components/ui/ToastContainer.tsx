import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: 'text-prepshot-teal',
  error: 'text-destructive',
  info: 'text-prepshot-sage',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80">
      {toasts.map(toast => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className="flex items-start gap-3 bg-card border border-border rounded-lg px-4 py-3 shadow-lg"
          >
            <Icon size={16} className={`mt-0.5 shrink-0 ${colors[toast.type]}`} />
            <p className="flex-1 text-sm text-foreground">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
