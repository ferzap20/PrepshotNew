import { v4 as uuidv4 } from 'uuid';

export const generateId = (): string => uuidv4();
export const nowISO = (): string => new Date().toISOString();
