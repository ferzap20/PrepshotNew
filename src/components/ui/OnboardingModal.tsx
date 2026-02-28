import { useState, useEffect } from 'react';
import { FolderOpen, BookOpen, ListChecks, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const STORAGE_KEY = 'prepshot-onboarded';

const steps = [
  {
    icon: FolderOpen,
    title: 'Create a project',
    description: 'Each film or shoot gets its own project with dates, crew type, and production details.',
  },
  {
    icon: BookOpen,
    title: 'Browse the catalog',
    description: 'Discover pre-loaded cinema gear — cameras, lenses, lights, and grip — ready to add.',
  },
  {
    icon: ListChecks,
    title: 'Build your gear list',
    description: 'Assemble your kit, plan shooting days, and publish the list for your crew.',
  },
];

export function OnboardingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-6">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Welcome to PrepShot</h2>
          <p className="text-sm text-muted-foreground">
            Your offline-first gear management tool for film & TV productions.
          </p>
        </div>

        <div className="space-y-4">
          {steps.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4 items-start">
              <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full" onClick={dismiss}>
          Get started
        </Button>
      </div>
    </div>
  );
}
