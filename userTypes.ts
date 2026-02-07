export interface ImmigrationDocument {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    data: string;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    visaStatus?: string;
    location?: string;
    visaExpirationDate?: string;
    immigrationDocuments?: ImmigrationDocument[];
    createdAt: string;
    updatedAt: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    visaStatus?: string;
    location?: string;
    visaExpirationDate?: string;
    immigrationDocuments?: ImmigrationDocument[];
}

export const VISA_STATUS_OPTIONS = [
    'H-1B',
    'H-4',
    'F-1 (OPT)',
    'F-1 (CPT)',
    'L-1A',
    'L-1B',
    'O-1',
    'TN',
    'E-2',
    'E-3',
    'J-1',
    'Green Card (Pending)',
    'Green Card (Approved)',
    'US Citizen',
    'Other'
] as const;
