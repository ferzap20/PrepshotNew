import { useState, useEffect, type FormEvent } from 'react';
import { Save, Download, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { useAppSettings } from '@/hooks/useAppSettings';
import {
  appSettingsRepo,
  usersRepo,
  projectsRepo,
  catalogItemsRepo,
  rentalSourcesRepo,
  projectGeneralListsRepo,
  shootingDaysRepo,
  dayListModificationsRepo,
  packageTemplatesRepo,
  templateItemsRepo,
  userGearRepo,
} from '@/lib/db/repositories';
import { UserRole } from '@/types/enums';

const DATE_FORMAT_OPTIONS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g. 25/02/2026)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g. 02/25/2026)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (e.g. 2026-02-25)' },
];

function AccountSettings() {
  const { session } = useAuth();
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session?.userId) {
      usersRepo.getById(session.userId).then((user) => {
        setName(user?.name ?? '');
        setIsLoading(false);
      });
    }
  }, [session?.userId]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.userId) return;
    setIsSaving(true);
    try {
      await usersRepo.update(session.userId, { name: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <h3 className="mb-3">Account</h3>
        <div className="h-20 bg-secondary rounded animate-pulse" />
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-3">Account</h3>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{session?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Role</span>
            <span className="capitalize">{session?.role}</span>
          </div>
        </div>
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSaving}>
            <Save size={14} />
            Save
          </Button>
          {saved && <span className="text-sm text-emerald-500">Saved!</span>}
        </div>
      </form>
    </Card>
  );
}

function DateFormatSettings() {
  const { settings, setSetting } = useAppSettings();
  const [format, setFormat] = useState(settings['date_format'] ?? 'DD/MM/YYYY');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    await setSetting('date_format', format);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <h3 className="mb-1">Display</h3>
      <p className="text-sm text-muted-foreground mb-4">Preferences for how information is shown.</p>
      <form onSubmit={handleSave} className="space-y-4">
        <Select
          label="Date Format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          options={DATE_FORMAT_OPTIONS}
        />
        <div className="flex items-center gap-3">
          <Button type="submit"><Save size={14} />Save</Button>
          {saved && <span className="text-sm text-emerald-500">Saved!</span>}
        </div>
      </form>
    </Card>
  );
}

function AdminSettings() {
  const { settings, setSetting } = useAppSettings();
  const [label, setLabel] = useState(settings['personal_item_label'] ?? 'personal item');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    await setSetting('personal_item_label', trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <h3 className="mb-1">Admin Settings</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Configure app-wide options visible to all users.
      </p>
      <form onSubmit={handleSave} className="space-y-4">
        <Input
          label="Personal Item Badge Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. personal item"
        />
        <p className="text-xs text-muted-foreground -mt-2">
          This label appears next to items added from My Gear in a project prep list.
        </p>
        <div className="flex items-center gap-3">
          <Button type="submit">
            <Save size={14} />
            Save
          </Button>
          {saved && <span className="text-sm text-emerald-500">Saved!</span>}
        </div>
      </form>
    </Card>
  );
}

function DataManagement() {
  const [isExporting, setIsExporting] = useState(false);
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    const [users, projects, catalog, rentalSources, generalLists, shootingDays, dayMods, templates, templateItems, userGear, settings] =
      await Promise.all([
        usersRepo.getAll(),
        projectsRepo.getAll(),
        catalogItemsRepo.getAll(),
        rentalSourcesRepo.getAll(),
        projectGeneralListsRepo.getAll(),
        shootingDaysRepo.getAll(),
        dayListModificationsRepo.getAll(),
        packageTemplatesRepo.getAll(),
        templateItemsRepo.getAll(),
        userGearRepo.getAll(),
        appSettingsRepo.getAll(),
      ]);
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      data: {
        users: users.map(({ passwordHash: _, ...u }) => u),
        projects,
        catalog,
        rentalSources,
        generalLists,
        shootingDays,
        dayMods,
        templates,
        templateItems,
        userGear,
        settings,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prepshot-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  const handleClear = async () => {
    setIsClearing(true);
    await Promise.all([
      projectsRepo.getAll().then((items) => Promise.all(items.map((i) => projectsRepo.remove(i.id)))),
      projectGeneralListsRepo.getAll().then((items) => Promise.all(items.map((i) => projectGeneralListsRepo.remove(i.id)))),
      shootingDaysRepo.getAll().then((items) => Promise.all(items.map((i) => shootingDaysRepo.remove(i.id)))),
      dayListModificationsRepo.getAll().then((items) => Promise.all(items.map((i) => dayListModificationsRepo.remove(i.id)))),
      packageTemplatesRepo.getAll().then((items) => Promise.all(items.map((i) => packageTemplatesRepo.remove(i.id)))),
      templateItemsRepo.getAll().then((items) => Promise.all(items.map((i) => templateItemsRepo.remove(i.id)))),
      userGearRepo.getAll().then((items) => Promise.all(items.map((i) => userGearRepo.remove(i.id)))),
    ]);
    setIsClearing(false);
    setIsClearOpen(false);
  };

  return (
    <>
      <Card>
        <h3 className="mb-1">Data</h3>
        <p className="text-sm text-muted-foreground mb-4">Backup and manage your local data.</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleExport} disabled={isExporting}>
            <Download size={14} />
            {isExporting ? 'Exporting…' : 'Export Backup'}
          </Button>
          <Button variant="danger" onClick={() => setIsClearOpen(true)}>
            <Trash2 size={14} />
            Clear Project Data
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Export saves all your data as a JSON file. Clearing removes projects, gear lists, shooting days and templates — catalog and rental sources are kept.
        </p>
      </Card>

      <Modal isOpen={isClearOpen} onClose={() => setIsClearOpen(false)} title="Clear Project Data">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will permanently delete all projects, gear lists, shooting days, and templates.
            Catalog items and rental sources will be kept. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsClearOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleClear} disabled={isClearing}>
              {isClearing ? 'Clearing…' : 'Clear Data'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function SettingsPage() {
  const { session } = useAuth();
  const isAdmin = session?.role === UserRole.Admin;

  return (
    <div className="space-y-6">
      <h1>Settings</h1>

      <AccountSettings />

      <DateFormatSettings />

      {isAdmin && <AdminSettings />}

      <DataManagement />
    </div>
  );
}
