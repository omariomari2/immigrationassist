import type { EmployerData, EmployerDataFile } from './types';

let cachedEmployerData: EmployerDataFile | null = null;
let inFlight: Promise<EmployerDataFile> | null = null;

export const globalAverageApprovalRate = 95.0; // Hardcoded or calculated

export async function loadEmployerData(): Promise<EmployerDataFile> {
    if (cachedEmployerData) return cachedEmployerData;
    if (inFlight) return inFlight;

    inFlight = fetch('/employerData.json', { cache: 'no-cache' })
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`Failed to load employer data: ${response.status}`);
            }
            const data = await response.json();
            cachedEmployerData = data as EmployerDataFile;
            return cachedEmployerData;
        })
        .finally(() => {
            inFlight = null;
        });

    return inFlight;
}

// Helper functions for approval levels
export const getApprovalLevel = (rate: number) => {
    if (rate >= 98) return 'Exceptional';
    if (rate >= 90) return 'High';
    if (rate >= 80) return 'Moderate';
    return 'Low';
};

export const getApprovalStyles = (level: string) => {
    switch (level) {
        case 'Exceptional':
            return { color: '#4ADE80', bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-800', label: 'Exceptional', icon: 'text-green-600' };
        case 'High':
            return { color: '#84CC16', bg: 'bg-lime-50', border: 'border-lime-100', text: 'text-lime-800', label: 'High', icon: 'text-lime-600' };
        case 'Moderate':
            return { color: '#FACC15', bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-800', label: 'Moderate', icon: 'text-yellow-600' };
        default:
            return { color: '#EF4444', bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-800', label: 'Low', icon: 'text-red-600' };
    }
};

export const searchEmployers = (data: EmployerDataFile, query: string): EmployerData[] => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return [];
    const lowerQuery = trimmed.toLowerCase();

    const indices = new Set<number>();

    const directMatch = data.searchIndex[lowerQuery];
    if (directMatch !== undefined) {
        if (Array.isArray(directMatch)) directMatch.forEach(idx => indices.add(idx));
        else indices.add(directMatch);
    }

    const words = lowerQuery.split(/\s+/).filter(word => word.length > 2);
    for (const word of words) {
        const match = data.searchIndex[word];
        if (match !== undefined) {
            if (Array.isArray(match)) match.forEach(idx => indices.add(idx));
            else indices.add(match);
        }
    }

    if (indices.size === 0) {
        // Fallback: linear scan for partial matches across all employers.
        for (let i = 0; i < data.employers.length; i += 1) {
            const emp = data.employers[i];
            if (emp.name.toLowerCase().includes(lowerQuery)) {
                indices.add(i);
                if (indices.size >= 50) break;
            }
        }
    }

    return Array.from(indices)
        .map(idx => data.employers[idx])
        .filter(Boolean)
        .slice(0, 20);
};

export const getTopEmployers = (data: EmployerDataFile, count: number = 10): EmployerData[] => {
    return data.employers.slice(0, count);
};

export const getTotalFilingsForYear = (data: EmployerDataFile, year: number): number => {
    return data.employers.reduce((total, employer) => {
        const yearData = employer.yearlyHistory.find(y => y.year === year);
        if (yearData) {
            return total + yearData.approvals + yearData.denials;
        }
        return total;
    }, 0);
};
