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
