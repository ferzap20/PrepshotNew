import { Phone, Globe, Mail, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { RentalCompany, RentalSource } from '@/types/models';

interface RentalCompanyCardProps {
  company: RentalCompany;
  isLocal?: boolean;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

/** Adapts a local RentalSource (IndexedDB) into a RentalCompany shape */
export function localSourceToCompany(s: RentalSource): RentalCompany {
  return {
    id: s.id,
    name: s.name,
    city: s.location || '',
    country: '',
    address: s.address || '',
    phone: '',
    email: '',
    website: '',
    specialties: [],
    featured: false,
    notes: s.notes || '',
  };
}

export function RentalCompanyCard({
  company,
  isLocal,
  isAdmin,
  onEdit,
  onDelete,
}: RentalCompanyCardProps) {
  return (
    <Card className="p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{company.name}</span>
            {isLocal && (
              <Badge variant="warning" className="text-[10px]">
                Custom
              </Badge>
            )}
          </div>
          {company.address && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{company.address}</p>
          )}
        </div>
        {isAdmin && isLocal && onEdit && onDelete && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {company.specialties.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {company.specialties.map((s) => (
            <Badge key={s} variant="info" className="text-[10px]">
              {s}
            </Badge>
          ))}
        </div>
      )}

      {company.notes && (
        <p className="text-xs text-muted-foreground">{company.notes}</p>
      )}

      <div className="flex items-center gap-3 flex-wrap pt-1">
        {company.phone && (
          <a
            href={`tel:${company.phone}`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone size={12} />
            {company.phone}
          </a>
        )}
        {company.email && (
          <a
            href={`mailto:${company.email}`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail size={12} />
            Email
          </a>
        )}
        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Globe size={12} />
            Website
          </a>
        )}
      </div>
    </Card>
  );
}
