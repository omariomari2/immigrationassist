import { MapPin, Building2, Hash, TrendingUp, Award, Briefcase, ExternalLink } from 'lucide-react';
import { EmployerData, getApprovalLevel, getApprovalStyles } from '../data/employerData';

interface CompanyDetailsPanelProps {
  employer: EmployerData;
}

export function CompanyDetailsPanel({ employer }: CompanyDetailsPanelProps) {
  const approvalLevel = getApprovalLevel(employer.approvalRate);
  const styles = getApprovalStyles(approvalLevel);

  // Determine size category based on total cases
  const getSizeCategory = (cases: number) => {
    if (cases >= 5000) return 'Large Enterprise (5000+ H1Bs)';
    if (cases >= 1000) return 'Mid-Size (1000-4999 H1Bs)';
    if (cases >= 100) return 'Small (100-999 H1Bs)';
    return 'Startup/Small (<100 H1Bs)';
  };

  const sizeCategory = getSizeCategory(employer.totalCases);

  return (
    <div className={`rounded-xl border ${styles.border} ${styles.bg} overflow-hidden`}>
      <div className={`px-6 py-4 ${styles.bg}`}>
        <h3 className={`text-lg font-semibold ${styles.text}`}>
          Company Profile
        </h3>
        <p className={`text-sm mt-1 ${styles.text} opacity-80`}>
          {employer.name}
        </p>
      </div>

      <div className="p-6 space-y-4">
        {/* Location */}
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-2 rounded-lg bg-white ${styles.icon}`}>
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 block">Location</span>
            <span className="text-gray-900">
              {employer.city || 'Unknown'}, {employer.state || 'Unknown'} {employer.zipCode}
            </span>
          </div>
        </div>

        {/* Industry */}
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-2 rounded-lg bg-white ${styles.icon}`}>
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 block">Industry (NAICS)</span>
            <span className="text-gray-900">{employer.industry || 'Not specified'}</span>
          </div>
        </div>

        {/* Company Size */}
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-2 rounded-lg bg-white ${styles.icon}`}>
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 block">H1B Sponsor Category</span>
            <span className="text-gray-900">{sizeCategory}</span>
          </div>
        </div>

        {/* Total Cases */}
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-2 rounded-lg bg-white ${styles.icon}`}>
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 block">Total H1B Filings (2020-2025)</span>
            <span className="text-gray-900 font-semibold">{employer.totalCases.toLocaleString()} cases</span>
          </div>
        </div>

        {/* Approval Rate */}
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-2 rounded-lg bg-white ${styles.icon}`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 block">Approval Rate</span>
            <span className={`font-semibold`} style={{ color: styles.color }}>
              {employer.approvalRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-2 rounded-lg bg-white ${styles.icon}`}>
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 block">Sponsor Rating</span>
            <span 
              className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mt-1"
              style={{ backgroundColor: styles.color }}
            >
              {styles.label}
            </span>
          </div>
        </div>
      </div>

      {/* Advice Box */}
      <div className={`px-6 py-4 border-t ${styles.border} ${styles.bg}`}>
        <h4 className={`text-sm font-semibold ${styles.text} mb-2`}>
          Job Seeker Insights
        </h4>
        <p className={`text-sm ${styles.text} opacity-80`}>
          {employer.approvalRate >= 90 
            ? `${employer.name} has an excellent H1B approval track record. Strong candidate for sponsorship opportunities.`
            : employer.approvalRate >= 80
            ? `${employer.name} maintains a solid approval rate. Consider this employer for H1B sponsorship.`
            : employer.approvalRate >= 60
            ? `${employer.name} has a moderate approval rate. Ensure strong documentation when applying.`
            : `${employer.name} has a lower approval rate. Research their sponsorship process carefully before applying.`}
        </p>
      </div>

      {/* Data Source */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <a 
          href="https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          Data: USCIS H-1B Employer Data Hub
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
