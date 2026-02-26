import { useState, type FormEvent } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
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

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  const data = await res.json();
  if (data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

export function RentalSourceForm({ initial, onSubmit, onCancel, submitLabel }: RentalSourceFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [latitude, setLatitude] = useState<number | null>(initial?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(initial?.longitude ?? null);
  const [contactInfo, setContactInfo] = useState(initial?.contactInfo ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');

  const handleGeocode = async () => {
    const query = address.trim() || location.trim();
    if (!query) { setGeocodeError('Enter an address or location to geocode'); return; }
    setIsGeocoding(true);
    setGeocodeError('');
    try {
      const coords = await geocodeAddress(query);
      if (!coords) { setGeocodeError('No results found. Try a more specific address.'); return; }
      setLatitude(coords.lat);
      setLongitude(coords.lng);
    } catch {
      setGeocodeError('Geocoding failed. Check your connection.');
    } finally {
      setIsGeocoding(false);
    }
  };

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
        latitude,
        longitude,
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
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Panavision New York" required />
      <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" />
      <Input label="City / Area" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. New York, NY" />

      {/* Geocoding */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={handleGeocode} disabled={isGeocoding}>
            {isGeocoding ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
            {isGeocoding ? 'Geocoding…' : 'Geocode Location'}
          </Button>
          {latitude !== null && longitude !== null && (
            <span className="text-xs text-emerald-500">
              {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </span>
          )}
          {latitude === null && <span className="text-xs text-muted-foreground">No coordinates set</span>}
        </div>
        {geocodeError && <p className="text-xs text-destructive">{geocodeError}</p>}
      </div>

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
