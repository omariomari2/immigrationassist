import React, { useState, useEffect } from 'react';
import { Info, ExternalLink } from 'lucide-react';
import { H1BStatsChart } from './H1BStatsChart';
import { TrendChart } from './TrendChart';
import { OpportunitiesPanel } from './OpportunitiesPanel';
import { H1BSearchHeader } from './H1BSearchHeader';
import { H1BKPIHeader } from './H1BKPIHeader';
import { EmployerData, EmployerSummary, EmployerSummaryResponse } from './types';
import { checkH1bApiHealth, fetchEmployerById, loadEmployerSummary } from './utils';

export function H1BAnalytics() {
    const [summary, setSummary] = useState<EmployerSummaryResponse | null>(null);
    const [selectedEmployer, setSelectedEmployer] = useState<EmployerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [apiOnline, setApiOnline] = useState<boolean | null>(null);

    useEffect(() => {
        let isActive = true;

        loadEmployerSummary()
            .then(async (data) => {
                if (!isActive) return;
                setSummary(data);
                if (!selectedEmployer) {
                    const first = data.topEmployers?.[0];
                    if (first) {
                        const details = await fetchEmployerById(first.id);
                        if (isActive) setSelectedEmployer(details);
                    }
                }
            })
            .catch((err) => {
                if (!isActive) return;
                setError(err instanceof Error ? err.message : 'Failed to load employer data.');
            })
            .finally(() => {
                if (isActive) setIsLoading(false);
            });

        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        let isActive = true;
        setApiOnline(null);
        checkH1bApiHealth()
            .then((ok) => {
                if (!isActive) return;
                setApiOnline(ok);
            })
            .catch(() => {
                if (!isActive) return;
                setApiOnline(false);
            });

        return () => {
            isActive = false;
        };
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl shadow-soft p-8 flex items-center justify-center text-sm text-gray-500">
                Loading employer data...
            </div>
        );
    }

    if (error || !summary) {
        return (
            <div className="bg-white rounded-3xl shadow-soft p-8 text-sm text-red-500">
                {error || 'Employer data unavailable.'}
            </div>
        );
    }

    const handleSelectEmployer = async (employer: EmployerSummary) => {
        try {
            const details = await fetchEmployerById(employer.id);
            setSelectedEmployer(details);
        } catch (err) {
            setSelectedEmployer(null);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {apiOnline === false && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700 shadow-soft">
                    H1B API is offline. Start the chatbot server on port <span className="font-semibold">8001</span> and refresh.
                </div>
            )}
            <div className="flex justify-between items-end">
                <H1BKPIHeader summary={summary} />
                <H1BSearchHeader
                    summary={summary}
                    selectedEmployer={selectedEmployer}
                    onSelect={handleSelectEmployer}
                />
            </div>

            {selectedEmployer && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column - Stats (Approximately 50% width) */}
                    <div className="lg:col-span-6 space-y-6">
                        <H1BStatsChart employer={selectedEmployer} />
                    </div>

                    {/* Middle Column - Trend & Profile (Approximately 25% width) */}
                    <div className="lg:col-span-3 space-y-6">
                        <TrendChart employer={selectedEmployer} />
                    </div>

                    {/* Right Column - Opportunities (Approximately 25% width) */}
                    <div className="lg:col-span-3 space-y-6">
                        <OpportunitiesPanel employer={selectedEmployer} />

                        <p className="text-xs text-gray-400 leading-relaxed">
                            <span className="font-semibold uppercase tracking-wider text-[10px] text-gray-400 block mb-1">
                                Understanding Data
                            </span>
                            H1B approval rates vary by employer, job category, and candidate qualifications.
                            This data (FY {summary.metadata.yearRange}) shows historical decisions but does not guarantee future results.
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
            )}
        </div>
    );
}
