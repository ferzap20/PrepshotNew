import { useState, useEffect, lazy, Suspense } from 'react';
import { Plus, Search, MapPin, Building2, Pencil, Trash2, Loader2, Map, List } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  CreateRentalSourceModal,
  EditRentalSourceModal,
  DeleteRentalSourceDialog,
} from '@/components/rental-sources/RentalSourceModals';
import { rentalSourcesRepo } from '@/lib/db/repositories';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/enums';
import { cn } from '@/lib/utils/cn';
import type { RentalSource } from '@/types/models';

const RentalMap = lazy(() =>
  import('@/components/rental-sources/RentalMap').then((m) => ({ default: m.RentalMap })),
);

const LAST_CITY_KEY = 'prepshot_last_rental_city';

async function geocodeCity(city: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } },
    );
    const data = await res.json();
    if (!data.length) return null;
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {
    return null;
  }
}

export function RentalSourcesPage() {
  const { session } = useAuth();
  const isAdmin = session?.role === UserRole.Admin;

  const [sources, setSources] = useState<RentalSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [citySearch, setCitySearch] = useState(() => localStorage.getItem(LAST_CITY_KEY) ?? '');
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<RentalSource | null>(null);
  const [deletingSource, setDeletingSource] = useState<RentalSource | null>(null);

  const load = async () => {
    setIsLoading(true);
    const data = await rentalSourcesRepo.getAll();
    data.sort((a, b) => a.name.localeCompare(b.name));
    setSources(data);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    const lastCity = localStorage.getItem(LAST_CITY_KEY);
    if (lastCity) {
      geocodeCity(lastCity).then((coords) => { if (coords) setMapCenter(coords); });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setMapCenter([pos.coords.latitude, pos.coords.longitude]),
        () => {},
        { timeout: 5000 },
      );
    }
  }, []);

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearch.trim()) return;
    setIsSearching(true);
    const coords = await geocodeCity(citySearch.trim());
    setIsSearching(false);
    if (coords) {
      setMapCenter(coords);
      localStorage.setItem(LAST_CITY_KEY, citySearch.trim());
    }
  };

  const handleSelectSource = (id: string) => {
    setSelectedId(id);
    setMobileTab('map');
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between gap-4 flex-shrink-0">
        <h1>Rental Sources</h1>
        {isAdmin && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} />
            Add Source
          </Button>
        )}
      </div>

      <form onSubmit={handleCitySearch} className="flex gap-2 flex-shrink-0">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            placeholder="Search city or area to center the map…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <Button type="submit" variant="secondary" disabled={isSearching}>
          {isSearching ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
          Go
        </Button>
      </form>

      <div className="flex gap-1 lg:hidden flex-shrink-0">
        <button
          onClick={() => setMobileTab('list')}
          className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors', mobileTab === 'list' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground')}
        >
          <List size={14} /> List
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors', mobileTab === 'map' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground')}
        >
          <Map size={14} /> Map
        </button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className={cn('flex flex-col gap-2 overflow-y-auto lg:w-2/5', mobileTab === 'map' ? 'hidden lg:flex' : 'flex w-full')}>
          {isLoading ? (
            [1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse flex-shrink-0" />)
          ) : sources.length === 0 ? (
            <EmptyState
              icon={<Building2 size={32} />}
              title="No rental sources yet"
              description={isAdmin ? 'Add the first rental source.' : 'No rental sources have been added.'}
              action={isAdmin ? <Button onClick={() => setIsCreateOpen(true)}><Plus size={16} />Add Source</Button> : undefined}
            />
          ) : (
            sources.map((source) => (
              <Card
                key={source.id}
                hoverable
                onClick={() => handleSelectSource(source.id)}
                className={cn('flex items-start gap-3 py-3 px-4 cursor-pointer flex-shrink-0', selectedId === source.id && 'ring-1 ring-primary')}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{source.name}</span>
                    {source.latitude !== null && <MapPin size={12} className="text-primary flex-shrink-0" />}
                  </div>
                  {source.address && <p className="text-xs text-muted-foreground mt-0.5 truncate">{source.address}</p>}
                  {source.location && !source.address && <p className="text-xs text-muted-foreground mt-0.5">{source.location}</p>}
                  {source.contactInfo && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{source.contactInfo}</p>}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); setEditingSource(source); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><Pencil size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setDeletingSource(source); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"><Trash2 size={14} /></button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        <div className={cn('flex-1 min-h-[400px] lg:min-h-0 rounded-xl overflow-hidden', mobileTab === 'list' ? 'hidden lg:block' : 'block')}>
          <Suspense fallback={<div className="h-full w-full bg-secondary rounded-xl animate-pulse" />}>
            <RentalMap sources={sources} flyTo={mapCenter} selectedId={selectedId} onSelectSource={setSelectedId} />
          </Suspense>
        </div>
      </div>

      {isAdmin && (
        <>
          <CreateRentalSourceModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreated={() => load()} />
          {editingSource && <EditRentalSourceModal isOpen={true} onClose={() => setEditingSource(null)} source={editingSource} onUpdated={() => { load(); setEditingSource(null); }} />}
          {deletingSource && <DeleteRentalSourceDialog isOpen={true} onClose={() => setDeletingSource(null)} source={deletingSource} onDeleted={() => { load(); setDeletingSource(null); }} />}
        </>
      )}
    </div>
  );
}
