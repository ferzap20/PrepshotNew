import { useState, type FormEvent } from 'react';
import { Camera, Lightbulb, Cog } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { CrewType, ProjectRole } from '@/types/enums';
import { cn } from '@/lib/utils/cn';
import type { Project } from '@/types/models';

const CREW_OPTIONS = [
  { value: CrewType.Camera, label: 'Camera', icon: Camera },
  { value: CrewType.Lights, label: 'Lights', icon: Lightbulb },
  { value: CrewType.Machinerie, label: 'Machinerie', icon: Cog },
] as const;

const CREW_ROLES: Record<string, Array<{ value: string; label: string }>> = {
  [CrewType.Camera]: [
    { value: ProjectRole.FirstAC, label: '1st AC' },
    { value: ProjectRole.SecondAC, label: '2nd AC' },
    { value: ProjectRole.Loader, label: 'Loader' },
    { value: ProjectRole.DP, label: 'Director of Photography' },
    { value: 'DIT', label: 'DIT' },
    { value: 'Camera Operator', label: 'Camera Operator' },
    { value: 'Other', label: 'Other' },
  ],
  [CrewType.Lights]: [
    { value: 'Gaffer', label: 'Gaffer' },
    { value: 'Best Boy', label: 'Best Boy' },
    { value: 'Electrician', label: 'Electrician' },
    { value: 'Other', label: 'Other' },
  ],
  [CrewType.Machinerie]: [
    { value: 'Key Grip', label: 'Key Grip' },
    { value: 'Best Boy Grip', label: 'Best Boy Grip' },
    { value: 'Dolly Grip', label: 'Dolly Grip' },
    { value: 'Grip', label: 'Grip' },
    { value: 'Other', label: 'Other' },
  ],
};

interface ProjectFormProps {
  initial?: Partial<Project>;
  onSubmit: (data: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

export function ProjectForm({ initial, onSubmit, onCancel, submitLabel }: ProjectFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [crewType, setCrewType] = useState(initial?.crewType ?? CrewType.Camera);
  const [role, setRole] = useState(initial?.role ?? ProjectRole.FirstAC);
  const [productionCompany, setProductionCompany] = useState(initial?.productionCompany ?? '');
  const [firstAC, setFirstAC] = useState(initial?.firstAC ?? '');
  const [startDate, setStartDate] = useState(initial?.startDate ?? '');
  const [endDate, setEndDate] = useState(initial?.endDate ?? '');
  const [trialStartDate, setTrialStartDate] = useState(initial?.trialStartDate ?? '');
  const [trialEndDate, setTrialEndDate] = useState(initial?.trialEndDate ?? '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDP = crewType === CrewType.Camera && role === ProjectRole.DP;
  const roleOptions = CREW_ROLES[crewType] ?? CREW_ROLES[CrewType.Camera];

  const handleCrewChange = (newCrew: string) => {
    setCrewType(newCrew);
    const roles = CREW_ROLES[newCrew];
    if (roles?.length) setRole(roles[0].value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Project name is required'); return; }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        crewType,
        role,
        productionCompany: productionCompany.trim(),
        firstAC: isDP ? firstAC.trim() : '',
        startDate: startDate || null,
        endDate: endDate || null,
        trialStartDate: trialStartDate || null,
        trialEndDate: trialEndDate || null,
        notes: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Project Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Feature Film 2025"
        required
      />

      {/* Crew type selector */}
      <div>
        <label className="block text-sm font-medium mb-2">Crew Department</label>
        <div className="grid grid-cols-3 gap-2">
          {CREW_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleCrewChange(value)}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium',
                crewType === value
                  ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/30'
                  : 'bg-secondary text-muted-foreground border-border hover:border-muted-foreground/40',
              )}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <Select
        label="Your Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        options={roleOptions}
      />
      {isDP && (
        <Input
          label="1st AC"
          value={firstAC}
          onChange={(e) => setFirstAC(e.target.value)}
          placeholder="Name of the 1st Assistant Camera"
        />
      )}
      <Input
        label="Production Company"
        value={productionCompany}
        onChange={(e) => setProductionCompany(e.target.value)}
        placeholder="e.g. Imagine Entertainment"
      />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Trial Start" type="date" value={trialStartDate} onChange={(e) => setTrialStartDate(e.target.value)} />
        <Input label="Trial End" type="date" value={trialEndDate} onChange={(e) => setTrialEndDate(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Shoot Start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="Shoot End" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? `${submitLabel}...` : submitLabel}
        </Button>
      </div>
    </form>
  );
}
