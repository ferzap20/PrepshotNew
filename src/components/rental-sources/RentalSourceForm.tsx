import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import type { RentalSource } from '@/types/models';

interface RentalSourceFormProps {
  initial?: Partial<RentalSource>;
  onSubmit: (data: Omit<RentalSource, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

export function RentalSourceForm({ initial, onSubmit, onCancel, submitLabel }: RentalSourceFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [contactInfo, setContactInfo] = useState(initial?.contactInfo ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        address: address.trim(),
        location: location.trim(),
        latitude: null,
        longitude: null,
        contactInfo: contactInfo.trim(),
        notes: notes.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Local Camera Rental" required />
      <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" />
      <Input label="City / Area" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Paris" />
      <Textarea label="Contact Info" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder="Phone, email, website…" />
      <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Hours, specialties, notes…" />

      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? `${submitLabel}…` : submitLabel}
        </Button>
      </div>
    </form>
  );
}
