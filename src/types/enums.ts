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
  DIT: 'DIT',
  CameraOperator: 'Camera Operator',
  Gaffer: 'Gaffer',
  BestBoy: 'Best Boy',
  Electrician: 'Electrician',
  KeyGrip: 'Key Grip',
  BestBoyGrip: 'Best Boy Grip',
  DollyGrip: 'Dolly Grip',
  Grip: 'Grip',
  Other: 'Other',
} as const;
export type ProjectRole = (typeof ProjectRole)[keyof typeof ProjectRole];

export const CREW_ROLES_BY_TYPE: Record<string, Array<{ value: string; label: string }>> = {
  [CrewType.Camera]: [
    { value: ProjectRole.FirstAC, label: '1st AC' },
    { value: ProjectRole.SecondAC, label: '2nd AC' },
    { value: ProjectRole.Loader, label: 'Loader' },
    { value: ProjectRole.DP, label: 'Director of Photography' },
    { value: ProjectRole.DIT, label: 'DIT' },
    { value: ProjectRole.CameraOperator, label: 'Camera Operator' },
    { value: ProjectRole.Other, label: 'Other' },
  ],
  [CrewType.Lights]: [
    { value: ProjectRole.Gaffer, label: 'Gaffer' },
    { value: ProjectRole.BestBoy, label: 'Best Boy' },
    { value: ProjectRole.Electrician, label: 'Electrician' },
    { value: ProjectRole.Other, label: 'Other' },
  ],
  [CrewType.Machinerie]: [
    { value: ProjectRole.KeyGrip, label: 'Key Grip' },
    { value: ProjectRole.BestBoyGrip, label: 'Best Boy Grip' },
    { value: ProjectRole.DollyGrip, label: 'Dolly Grip' },
    { value: ProjectRole.Grip, label: 'Grip' },
    { value: ProjectRole.Other, label: 'Other' },
  ],
};

export const CatalogCategory = {
  Camera: 'Camera',
  Lens: 'Lens',
  Cable: 'Cable',
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
