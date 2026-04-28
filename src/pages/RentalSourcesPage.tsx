import { useState, useEffect } from 'react';
import { Plus, Search, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CategoryFilterPills } from '@/components/ui/CategoryFilterPills';
import {
  CreateRentalSourceModal,
  EditRentalSourceModal,
  DeleteRentalSourceDialog,
} from '@/components/rental-sources/RentalSourceModals';
import { RentalCompanyCard } from '@/components/rental-sources/RentalCompanyCard';
import { localSourceToCompany } from '@/utils/rentalSourceAdapter';
import { DebugFileBadge } from '@/components/debug/DebugFileBadge';
import { rentalSourcesRepo } from '@/lib/db/repositories';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/enums';
import type { RentalCompany, RentalSource } from '@/types/models';
import rentalCompaniesData from '@/data/rental-companies.json';

const LAST_CITY_KEY = 'prepshot_last_rental_city';

const SPECIALTIES = ['Camera', 'Lenses', 'Lighting', 'Grip'] as const;

/** Extract unique cities from the combined list */
function getUniqueCities(companies: RentalCompany[]): string[] {
  const cities = new Set(companies.map((c) => c.city).filter(Boolean));
  return Array.from(cities).sort();
}

/** Reverse-geocode coords to city name via Nominatim */
async function reverseGeocodeCity(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en' } },
    );
    const data = await res.json();
    return data?.address?.city || data?.address?.town || data?.address?.state || null;
  } catch {
    return null;
  }
}

export function RentalSourcesPage() {
  const { session } = useAuth();
  const isAdmin = session?.role === UserRole.Admin;

  const [localSources, setLocalSources] = useState<RentalSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [citySearch, setCitySearch] = useState('');
  const [activeCity, setActiveCity] = useState(() => localStorage.getItem(LAST_CITY_KEY) ?? '');
  const [activeSpecialty, setActiveSpecialty] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<RentalSource | null>(null);
  const [deletingSource, setDeletingSource] = useState<RentalSource | null>(null);

  // Merge hardcoded + local sources
  const hardcoded: RentalCompany[] = rentalCompaniesData as RentalCompany[];
  const localAsCompanies = localSources.map(localSourceToCompany);
  const allCompanies = [...hardcoded, ...localAsCompanies];
  const cities = getUniqueCities(allCompanies);

  // Filter
  const filtered = allCompanies.filter((c) => {
    if (activeCity && c.city.toLowerCase() !== activeCity.toLowerCase()) return false;
    if (activeSpecialty && !c.specialties.includes(activeSpecialty)) return false;
    return true;
  });

  // Sort: alphabetical by name
  filtered.sort((a, b) => a.name.localeCompare(b.name));

  const load = async () => {
    setIsLoading(true);
    const data = await rentalSourcesRepo.getAll();
    setLocalSources(data);
    setIsLoading(false);
  };

  useEffect(() => {
    load();

    // Try to detect city from last search or geolocation
    const lastCity = localStorage.getItem(LAST_CITY_KEY);
    if (!lastCity && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const city = await reverseGeocodeCity(pos.coords.latitude, pos.coords.longitude);
          if (city) {
            // Find closest matching city in our directory
            const match = cities.find((c) => c.toLowerCase().includes(city.toLowerCase()));
            if (match) {
              setActiveCity(match);
              localStorage.setItem(LAST_CITY_KEY, match);
            }
          }
        },
        () => {},
        { timeout: 5000 },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCitySelect = (city: string) => {
    setActiveCity(city);
    if (city) {
      localStorage.setItem(LAST_CITY_KEY, city);
    } else {
      localStorage.removeItem(LAST_CITY_KEY);
    }
  };

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearch.trim()) return;
    const match = cities.find((c) => c.toLowerCase().includes(citySearch.trim().toLowerCase()));
    if (match) {
      handleCitySelect(match);
      setCitySearch('');
    }
  };

  // Track which local source IDs exist for edit/delete
  const localIds = new Set(localSources.map((s) => s.id));

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1>Rental Sources</h1>
          <DebugFileBadge />
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} />
            Add Custom
          </Button>
        )}
      </div>

      {/* City search bar */}
      <form onSubmit={handleCitySearch} className="flex gap-2 flex-shrink-0">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            placeholder="Search city…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
      </form>

      {/* City pills */}
      <div className="flex-shrink-0 space-y-2">
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => handleCitySelect('')}
            className={`px-2.5 py-1 rounded-full text-xs transition-colors ${!activeCity ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            All Cities
          </button>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => handleCitySelect(city === activeCity ? '' : city)}
              className={`px-2.5 py-1 rounded-full text-xs transition-colors ${activeCity === city ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Specialty filter */}
        <CategoryFilterPills
          categories={SPECIALTIES}
          active={activeSpecialty}
          onSelect={setActiveSpecialty}
          allLabel="All Specialties"
        />
      </div>

      {/* Heading */}
      {activeCity && (
        <p className="text-sm text-muted-foreground flex-shrink-0">
          Rental houses in <span className="font-medium text-foreground">{activeCity}</span>
        </p>
      )}

      {/* Company list */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse flex-shrink-0" />
          ))
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Building2 size={32} />}
            title="No rental houses found"
            description={
              activeCity || activeSpecialty
                ? 'Try a different city or specialty filter.'
                : 'No rental sources in the directory yet.'
            }
          />
        ) : (
          filtered.map((company) => (
            <RentalCompanyCard
              key={company.id}
              company={company}
              isLocal={localIds.has(company.id)}
              isAdmin={isAdmin}
              onEdit={() => {
                const src = localSources.find((s) => s.id === company.id);
                if (src) setEditingSource(src);
              }}
              onDelete={() => {
                const src = localSources.find((s) => s.id === company.id);
                if (src) setDeletingSource(src);
              }}
            />
          ))
        )}
      </div>

      {/* Admin modals (for custom local entries only) */}
      {isAdmin && (
        <>
          <CreateRentalSourceModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onCreated={() => load()}
          />
          {editingSource && (
            <EditRentalSourceModal
              isOpen={true}
              onClose={() => setEditingSource(null)}
              source={editingSource}
              onUpdated={() => {
                load();
                setEditingSource(null);
              }}
            />
          )}
          {deletingSource && (
            <DeleteRentalSourceDialog
              isOpen={true}
              onClose={() => setDeletingSource(null)}
              source={deletingSource}
              onDeleted={() => {
                load();
                setDeletingSource(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
