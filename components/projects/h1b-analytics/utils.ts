import type { EmployerData, EmployerSummary, EmployerSummaryResponse } from './types';

export const API_BASE = 'http://localhost:8001';

let cachedSummary: EmployerSummaryResponse | null = null;
let summaryInFlight: Promise<EmployerSummaryResponse> | null = null;

const employerCache = new Map<number, EmployerData>();

export const globalAverageApprovalRate = 95.0;

async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
}

export async function checkH1bApiHealth(timeoutMs: number = 2000): Promise<boolean> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(`${API_BASE}/health`, { cache: 'no-cache', signal: controller.signal });
        return response.ok;
    } catch {
        return false;
    } finally {
        clearTimeout(timer);
    }
}

export async function loadEmployerSummary(): Promise<EmployerSummaryResponse> {
    if (cachedSummary) return cachedSummary;
    if (summaryInFlight) return summaryInFlight;

    summaryInFlight = fetchJson<EmployerSummaryResponse>(`${API_BASE}/h1b/summary`)
        .then((data) => {
            cachedSummary = data;
            return data;
        })
        .finally(() => {
            summaryInFlight = null;
        });

    return summaryInFlight;
}

export async function searchEmployers(query: string, limit: number = 20): Promise<EmployerSummary[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return [];
    const url = `${API_BASE}/h1b/search?q=${encodeURIComponent(trimmed)}&limit=${limit}`;
    const data = await fetchJson<{ results: EmployerSummary[] }>(url);
    return data.results || [];
}

export async function fetchEmployerById(id: number): Promise<EmployerData> {
    if (employerCache.has(id)) return employerCache.get(id)!;
    const data = await fetchJson<EmployerData>(`${API_BASE}/h1b/employer?id=${id}`);
    employerCache.set(id, data);
    return data;
}

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
