import { ExternalLink } from 'lucide-react';
import { H1BStatsChart } from './H1BStatsChart';
import { TrendChart } from './TrendChart';
import { OpportunitiesPanel } from './OpportunitiesPanel';
import { EmployerData, EmployerDataFile } from './types';

interface H1BAnalyticsContentProps {
    employerData: EmployerDataFile;
    selectedEmployer: EmployerData | null;
}

export function H1BAnalyticsContent({ employerData, selectedEmployer }: H1BAnalyticsContentProps) {
    if (!selectedEmployer) {
        return (
            <div className="bg-white rounded-3xl shadow-soft p-8 text-sm text-gray-500">
                Select an employer to view analytics.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-6">
                <H1BStatsChart employer={selectedEmployer} />
            </div>

            <div className="lg:col-span-3 space-y-6">
                <TrendChart employer={selectedEmployer} />
            </div>

            <div className="lg:col-span-3 space-y-6">
                <OpportunitiesPanel employer={selectedEmployer} />

                <p className="text-xs text-gray-400 leading-relaxed">
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-gray-400 block mb-1">
                        Understanding Data
                    </span>
                    H1B approval rates vary by employer, job category, and candidate qualifications.
                    This data (FY {employerData.metadata.yearRange}) shows historical decisions but does not guarantee future results.
                </p>

                <div className="text-center">
                    <a
                        href="https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        USCIS H-1B Employer Data Hub
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    );
}
