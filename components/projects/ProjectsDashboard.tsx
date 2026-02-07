import { useState, useEffect } from 'react';
import { H1BAnalyticsContent } from './h1b-analytics/H1BAnalyticsContent';
import { NewsProject } from './news-feed/NewsProject';
import { ProjectSelector } from './ProjectSelector';
import { H1BKPIHeader } from './h1b-analytics/H1BKPIHeader';
import { H1BSearchHeader } from './h1b-analytics/H1BSearchHeader';
import { checkH1bApiHealth, fetchEmployerById, loadEmployerSummary } from './h1b-analytics/utils';
import { EmployerSummaryResponse, EmployerData, EmployerSummary } from './h1b-analytics/types';

export enum ProjectOption {
    H1B = 'H-1B Analytics',
    News = 'Immigrant News'
}

export function ProjectsDashboard() {
    const [activeProject, setActiveProject] = useState<ProjectOption>(ProjectOption.H1B);
    const [summary, setSummary] = useState<EmployerSummaryResponse | null>(null);
    const [selectedEmployer, setSelectedEmployer] = useState<EmployerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [apiOnline, setApiOnline] = useState<boolean | null>(null);

    useEffect(() => {
        let isActive = true;
        console.log('[ProjectsDashboard] Mounting, fetching data...');

        loadEmployerSummary()
            .then(async (data) => {
                if (!isActive) return;
                console.log('[ProjectsDashboard] Summary loaded.');
                setSummary(data);

                const first = data.topEmployers?.[0];
                if (first) {
                    try {
                        const details = await fetchEmployerById(first.id);
                        if (isActive) setSelectedEmployer(details);
                    } catch (err) {
                        if (isActive) setSelectedEmployer(null);
                    }
                }
            })
            .catch((err) => {
                if (!isActive) return;
                console.error('[ProjectsDashboard] Data load error', err);
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
        if (activeProject !== ProjectOption.H1B) return () => {
            isActive = false;
        };

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
    }, [activeProject]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl shadow-soft p-8 flex items-center justify-center text-sm text-gray-500">
                Loading data...
            </div>
        );
    }

    if (error || !summary) {
        return (
            <div className="bg-white rounded-3xl shadow-soft p-8 text-sm text-red-500">
                {error || 'Data unavailable.'}
            </div>
        );
    }

    const handleSelectEmployer = async (employer: EmployerSummary) => {
        try {
            const details = await fetchEmployerById(employer.id);
            setSelectedEmployer(details);
        } catch (err) {
            console.error('[ProjectsDashboard] Employer fetch error', err);
            setSelectedEmployer(null);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {activeProject === ProjectOption.H1B && apiOnline === false && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700 shadow-soft">
                    H1B API is offline. Start the chatbot server on port <span className="font-semibold">8001</span> and refresh.
                </div>
            )}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div className="flex flex-col gap-3">
                    <H1BKPIHeader summary={summary} />
                    <ProjectSelector
                        activeProject={activeProject}
                        onProjectChange={setActiveProject}
                    />
                </div>
                {activeProject === ProjectOption.H1B && (
                    <H1BSearchHeader
                        summary={summary}
                        selectedEmployer={selectedEmployer}
                        onSelect={handleSelectEmployer}
                    />
                )}
            </div>

            <div className="transition-all duration-500 ease-in-out">
                {activeProject === ProjectOption.H1B ? (
                    <H1BAnalyticsContent
                        summary={summary}
                        selectedEmployer={selectedEmployer}
                    />
                ) : (
                    <div className="w-full lg:w-1/2">
                        <div className="bg-white rounded-3xl shadow-soft overflow-hidden h-[70vh]">
                            <div className="h-full overflow-y-auto">
                                <NewsProject />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
