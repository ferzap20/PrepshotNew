export const UserRole = {
  Admin: 'admin',
  User: 'user',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ModificationType = {
  Add: 'add',
  Remove: 'remove',
  Modify: 'modify',
} as const;
export type ModificationType = (typeof ModificationType)[keyof typeof ModificationType];

export const FileType = {
  PDF: 'pdf',
  Image: 'image',
} as const;
export type FileType = (typeof FileType)[keyof typeof FileType];

export const CrewType = {
  Camera: 'Camera Crew',
  Lights: 'Lights Crew',
  Machinerie: 'Machinerie Crew',
} as const;
export type CrewType = (typeof CrewType)[keyof typeof CrewType];

export const ProjectRole = {
  DP: 'Director of Photography',
  FirstAC: '1st AC',
  SecondAC: '2nd AC',
  Loader: 'Loader',
} as const;
export type ProjectRole = (typeof ProjectRole)[keyof typeof ProjectRole];

export const CatalogCategory = {
  Camera: 'Camera',
  Lens: 'Lens',
  Accessory: 'Accessory',
  Grip: 'Grip',
  Lighting: 'Lighting',
  Audio: 'Audio',
} as const;
export type CatalogCategory = (typeof CatalogCategory)[keyof typeof CatalogCategory];

export const GearCondition = {
  Excellent: 'Excellent',
  Good: 'Good',
  Fair: 'Fair',
  NeedsRepair: 'Needs Repair',
} as const;
export type GearCondition = (typeof GearCondition)[keyof typeof GearCondition];
