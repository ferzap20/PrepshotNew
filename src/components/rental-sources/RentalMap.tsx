import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import type { RentalSource } from '@/types/models';

// Fix Leaflet default icon paths broken by Vite asset bundling
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

// ── Helpers ───────────────────────────────────────────────────────────────────

function FlyTo({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 13, { duration: 1.2 });
  }, [center, map]);
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface RentalMapProps {
  sources: RentalSource[];
  flyTo: [number, number] | null;
  selectedId: string | null;
  onSelectSource: (id: string) => void;
}

const DEFAULT_CENTER: [number, number] = [40.7128, -74.006]; // New York fallback

export function RentalMap({ sources, flyTo, selectedId, onSelectSource }: RentalMapProps) {
  const mapped = sources.filter((s) => s.latitude !== null && s.longitude !== null);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={11}
      className="h-full w-full rounded-xl"
      style={{ background: '#1a1d23' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <FlyTo center={flyTo} />
      {mapped.map((source) => (
        <Marker
          key={source.id}
          position={[source.latitude!, source.longitude!]}
          eventHandlers={{ click: () => onSelectSource(source.id) }}
        >
          <Popup>
            <div className="text-sm font-medium">{source.name}</div>
            {source.address && <div className="text-xs text-gray-600 mt-0.5">{source.address}</div>}
            {source.contactInfo && <div className="text-xs mt-1 whitespace-pre-line">{source.contactInfo}</div>}
          </Popup>
        </Marker>
      ))}
      {selectedId && (() => {
        const s = sources.find((x) => x.id === selectedId);
        if (s?.latitude && s.longitude) {
          return <FlyTo center={[s.latitude, s.longitude]} />;
        }
        return null;
      })()}
    </MapContainer>
  );
}
