import { useState, useEffect } from 'react';
import { ExternalLink, MapPin, Briefcase, Clock, Loader2 } from 'lucide-react';
import { EmployerData } from './types';
import { getOpportunitiesForCompany, JobOpportunity } from './jobsApi';

interface OpportunitiesPanelProps {
    employer: EmployerData;
}

export function OpportunitiesPanel({ employer }: OpportunitiesPanelProps) {
    const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const isDeloitte = employer.name.toLowerCase().includes('deloitte');
    const deloitteTalentNetworkUrl = 'https://www.deloitte.com/us/en/careers/join-deloitte-talent-networks.html';

    useEffect(() => {
        let cancelled = false;

        async function loadOpportunities() {
            setIsLoading(true);
            try {
                const jobs = await getOpportunitiesForCompany(employer.name);
                if (!cancelled) {
                    setOpportunities(jobs);
                }
            } catch (error) {
                console.error('Failed to load opportunities:', error);
                if (!cancelled) {
                    setOpportunities([]);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadOpportunities();

        return () => {
            cancelled = true;
        };
    }, [employer.name]);

    return (
        <div className="bg-white rounded-3xl shadow-soft p-6 flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Active Opportunities
                </h3>
                {!isLoading && opportunities.length > 0 && (
                    <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-medium">
                        {opportunities.length} Found
                    </span>
                )}
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
            ) : opportunities.length === 0 ? (
                <div className="text-center py-8 flex-1 flex flex-col justify-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Briefcase className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">No active listings</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">
                        Check {employer.name}'s careers page for the latest roles.
                    </p>
                    {isDeloitte && (
                        <a
                            href={deloitteTalentNetworkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors mx-auto"
                        >
                            Join Talent Network
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                </div>
            ) : (
                <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                    {opportunities.map((opp, idx) => (
                        <div key={idx} className="p-3 [@media(min-width:1570px)_and_(min-height:787px)]:p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-gray-200 transition-colors">
                            <div className="flex justify-between items-center gap-3 [@media(min-width:1570px)_and_(min-height:787px)]:items-start">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-1 [@media(min-width:1570px)_and_(min-height:787px)]:line-clamp-2">
                                        {opp.role}
                                    </h4>
                                    <div className="hidden [@media(min-width:1570px)_and_(min-height:787px)]:flex items-center gap-3 mt-2 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {opp.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {opp.posted}
                                        </span>
                                    </div>
                                </div>
                                <a
                                    href={opp.applyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-white rounded-lg shadow-sm text-gray-400 hover:text-black transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    ))}

                    <a
                        href="https://github.com/SimplifyJobs/Summer2025-Internships"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-xs text-gray-400 hover:text-gray-600 transition-colors mt-2"
                    >
                        Source: SimplifyJobs/Summer2025-Internships
                    </a>
                </div>
            )}
        </div>
    );
}
