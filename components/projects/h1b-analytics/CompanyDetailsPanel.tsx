import { MapPin, Building2, Hash, TrendingUp, Award, Briefcase } from 'lucide-react';
import { EmployerData } from './types';
import { getApprovalLevel, getApprovalStyles } from './utils';

interface CompanyDetailsPanelProps {
    employer: EmployerData;
}

export function CompanyDetailsPanel({ employer }: CompanyDetailsPanelProps) {
    const approvalLevel = getApprovalLevel(employer.approvalRate);
    const styles = getApprovalStyles(approvalLevel);

    const getSizeCategory = (cases: number) => {
        if (cases >= 5000) return 'Large Enterprise';
        if (cases >= 1000) return 'Mid-Size Corp';
        if (cases >= 100) return 'Small Business';
        return 'Startup/Boutique';
    };

    const sizeCategory = getSizeCategory(employer.totalCases);

    return (
        <div className="bg-white rounded-3xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Company Profile
                </h3>
                <span
                    className="text-[10px] px-2 py-1 rounded-full font-medium"
                    style={{ backgroundColor: `${styles.color}20`, color: styles.color.replace('#', '').length === 6 ? styles.color : undefined }} // basic hex color usage
                >
                    {styles.label} Tier
                </span>
            </div>

            <div className="space-y-5">
                <div className="hidden [@media(min-width:1570px)_and_(min-height:787px)]:flex items-start gap-4">
                    <div className="p-2 bg-gray-50 rounded-xl text-gray-500">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide block mb-0.5">Location</span>
                        <span className="text-sm font-medium text-gray-900 block leading-tight">
                            {employer.city || 'Unknown'}, {employer.state || 'Unknown'} <span className="text-gray-400 font-normal">{employer.zipCode}</span>
                        </span>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-50 rounded-xl text-gray-500">
                        <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide block mb-0.5">Industry</span>
                        <span className="text-sm font-medium text-gray-900 block leading-tight">{employer.industry || 'Not specified'}</span>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-50 rounded-xl text-gray-500">
                        <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide block mb-0.5">Category</span>
                        <span className="text-sm font-medium text-gray-900 block leading-tight">{sizeCategory}</span>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-50 rounded-xl text-gray-500">
                        <Hash className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide block mb-0.5">Total Filings</span>
                        <span className="text-sm font-medium text-gray-900 block leading-tight">{employer.totalCases.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
