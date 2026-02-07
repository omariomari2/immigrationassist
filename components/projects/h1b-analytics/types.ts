export interface YearlyData {
    approvals: number;
    denials: number;
}

export interface YearlyHistoryItem {
    year: number;
    approvals: number;
    denials: number;
    denialRate: number;
}

export interface Opportunity {
    role: string;
    location: string;
    posted: string;
    applyUrl?: string;
    simplifyUrl?: string;
}

export interface EmployerData {
    id?: number;
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
    yearlyHistory: YearlyHistoryItem[];
    opportunities?: Opportunity[];
}

export interface EmployerSummary {
    id: number;
    name: string;
    city: string;
    state: string;
    approvalRate: number;
    totalCases: number;
}

export interface EmployerDataFile {
    employers: EmployerData[];
    metadata: {
        totalEmployers: number;
        includedEmployers: number;
        yearRange: string;
        lastUpdated: string;
    };
}

export interface EmployerSummaryResponse {
    metadata: {
        totalEmployers: number;
        includedEmployers: number;
        yearRange: string;
        lastUpdated: string;
    };
    latestYear: number;
    totalFilingsLatestYear: number;
    topEmployers: EmployerSummary[];
}
