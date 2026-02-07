export interface Opportunity {
  company: string;
  normalizedCompany: string;
  role: string;
  location: string;
  applyUrl: string | null;
  simplifyUrl: string | null;
  posted: string;
  isSubListing: boolean;
}

export interface EmployerData {
  name: string;
  city: string;
  state: string;
  zipCode: string;
  industry: string;
  totalApprovals: number;
  totalDenials: number;
  totalCases: number;
  approvalRate: number;
  denialRate: number;
  yearlyHistory: {
    year: number;
    approvals: number;
    denials: number;
    denialRate: number;
  }[];
  opportunities?: Opportunity[];
  opportunityCount?: number;
}

export interface EmployerDataFile {
  employers: EmployerData[];
  searchIndex: Record<string, number | number[]>;
  metadata: {
    totalEmployers: number;
    includedEmployers: number;
    yearRange: string;
    lastUpdated: string;
  };
}

export type ApprovalLevel = 'excellent' | 'good' | 'fair' | 'poor';

export const getApprovalLevel = (rate: number): ApprovalLevel => {
  if (rate >= 90) return 'excellent';
  if (rate >= 80) return 'good';
  if (rate >= 60) return 'fair';
  return 'poor';
};

export const getApprovalStyles = (level: ApprovalLevel) => {
  switch (level) {
    case 'excellent':
      return {
        color: '#22c55e',
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-900',
        icon: 'text-green-600',
        label: 'Excellent Approval Rate'
      };
    case 'good':
      return {
        color: '#84cc16',
        bg: 'bg-lime-50',
        border: 'border-lime-200',
        text: 'text-lime-900',
        icon: 'text-lime-600',
        label: 'Good Approval Rate'
      };
    case 'fair':
      return {
        color: '#eab308',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-900',
        icon: 'text-yellow-600',
        label: 'Fair Approval Rate'
      };
    case 'poor':
      return {
        color: '#ef4444',
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        icon: 'text-red-600',
        label: 'Poor Approval Rate'
      };
  }
};

// Load employer data from JSON
import employerJson from './employerData.json';
export const employerData: EmployerDataFile = employerJson as EmployerDataFile;

// Calculate global average approval rate
const totalApproved = employerData.employers.reduce((sum, e) => sum + e.totalApprovals, 0);
const totalCases = employerData.employers.reduce((sum, e) => sum + e.totalCases, 0);
export const globalAverageApprovalRate = Math.round((totalApproved / totalCases) * 10) / 10;

// Search function for employers
export function searchEmployers(query: string): EmployerData[] {
  if (!query.trim()) return employerData.employers.slice(0, 50);
  
  const lowerQuery = query.toLowerCase();
  const results = new Set<number>();
  
  // Direct match
  if (employerData.searchIndex[lowerQuery] !== undefined) {
    const idx = employerData.searchIndex[lowerQuery];
    if (Array.isArray(idx)) {
      idx.forEach(i => results.add(i));
    } else {
      results.add(idx);
    }
  }
  
  // Word matches
  const words = lowerQuery.split(/\s+/).filter(w => w.length > 2);
  for (const word of words) {
    if (employerData.searchIndex[word] !== undefined) {
      const idx = employerData.searchIndex[word];
      if (Array.isArray(idx)) {
        idx.forEach(i => results.add(i));
      } else {
        results.add(idx);
      }
    }
  }
  
  return Array.from(results)
    .map(idx => employerData.employers[idx])
    .filter(Boolean)
    .slice(0, 50);
}
