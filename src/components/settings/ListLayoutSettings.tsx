import { Card } from '@/components/ui/Card';
import { useAppSettings } from '@/hooks/useAppSettings';

interface ToggleRowProps {
  label: string;
  settingKey: string;
  defaultValue?: boolean;
  settings: Record<string, string>;
  setSetting: (key: string, value: string) => Promise<void>;
}

function ToggleRow({ label, settingKey, defaultValue = true, settings, setSetting }: ToggleRowProps) {
  const value = settingKey in settings ? settings[settingKey] === 'true' : defaultValue;

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => setSetting(settingKey, String(!value))}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          value ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-4' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export function ListLayoutSettings() {
  const { settings, setSetting } = useAppSettings();

  const rows: { label: string; key: string; defaultValue?: boolean }[] = [
    { label: 'Show project name', key: 'list_layout.show_project_name' },
    { label: 'Show production company', key: 'list_layout.show_production_company' },
    { label: 'Show shoot dates', key: 'list_layout.show_dates' },
    { label: 'Show trial dates', key: 'list_layout.show_trial_dates', defaultValue: false },
    { label: 'Show notes', key: 'list_layout.show_notes', defaultValue: false },
    { label: 'Show item quantities', key: 'list_layout.show_quantity' },
    { label: 'Show brand names', key: 'list_layout.show_brand' },
  ];

  return (
    <Card className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        List Layout
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Controls what appears when printing or sharing a gear list.
      </p>
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <ToggleRow
            key={row.key}
            label={row.label}
            settingKey={row.key}
            defaultValue={row.defaultValue}
            settings={settings}
            setSetting={setSetting}
          />
        ))}
      </div>
    </Card>
  );
}
