import { z, type ZodSchema } from 'zod';
import { CatalogCategory, CrewType, GearCondition } from '@/types/enums';

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? 'Validation error');
  }
  return result.data;
}

export const ProjectCreateSchema = z
  .object({
    userId: z.string().min(1),
    name: z
      .string()
      .min(1, 'Project name is required')
      .max(100, 'Project name must be 100 characters or less'),
    crewType: z.enum(Object.values(CrewType) as [string, ...string[]]),
    role: z.string(),
    productionCompany: z.string(),
    firstAC: z.string(),
    notes: z.string(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    trialStartDate: z.string().nullable(),
    trialEndDate: z.string().nullable(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    { message: 'End date must be on or after start date', path: ['endDate'] },
  );

export const CatalogItemCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  category: z.enum(Object.values(CatalogCategory) as [string, ...string[]]),
  description: z.string(),
  aliases: z.array(z.string()),
  compatibilityNotes: z.string(),
  imageUrl: z.string().nullable(),
  subcategory: z.string().optional(),
  mount: z.string().optional(),
  source: z.string().optional(),
  specs: z.record(z.string(), z.unknown()).optional(),
  weightKg: z.number().optional(),
  connectors: z.array(z.string()).optional(),
});

export const UserGearItemCreateSchema = z.object({
  userId: z.string().min(1),
  catalogItemId: z.string().min(1, 'Catalog item is required'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1'),
  condition: z.enum(Object.values(GearCondition) as [string, ...string[]]),
  serialNumber: z.string(),
  notes: z.string(),
  purchaseDate: z.string().nullable(),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
