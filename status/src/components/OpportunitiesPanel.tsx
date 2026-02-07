import { ExternalLink, MapPin, Briefcase, Clock, Building2 } from 'lucide-react';
import { EmployerData, Opportunity } from '../data/employerData';

interface OpportunitiesPanelProps {
  employer: EmployerData;
}

export function OpportunitiesPanel({ employer }: OpportunitiesPanelProps) {
  const opportunities = employer.opportunities || [];

  if (opportunities.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No active opportunities found</p>
        <p className="text-sm text-gray-500 mt-1">
          {employer.name} doesn't have any listings in our current internship database.
          Check their careers page directly.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Active Opportunities
              </h3>
              <p className="text-sm text-gray-600">
                {opportunities.length} open position{opportunities.length > 1 ? 's' : ''} at {employer.name}
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Source: Summer 2026 Tech Internships
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {opportunities.map((opp: Opportunity, idx: number) => (
          <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 line-clamp-2">
                  {opp.role}
                </h4>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {opp.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Posted {opp.posted}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {opp.applyUrl && (
                  <a
                    href={opp.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {opp.simplifyUrl && (
                  <a
                    href={opp.simplifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Simplify
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
        <a
          href="https://github.com/SimplifyJobs/Summer2026-Internships"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          View more opportunities on GitHub →
        </a>
      </div>
    </div>
  );
}
