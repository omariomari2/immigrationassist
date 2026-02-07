import { useState, useEffect } from 'react';
import { H1BAnalyticsContent } from './h1b-analytics/H1BAnalyticsContent';
import { NewsProject } from './news-feed/NewsProject';
import { ProjectSelector } from './ProjectSelector';
import { H1BKPIHeader } from './h1b-analytics/H1BKPIHeader';
import { H1BSearchHeader } from './h1b-analytics/H1BSearchHeader';
import { loadEmployerData } from './h1b-analytics/utils';
import { EmployerDataFile, EmployerData } from './h1b-analytics/types';

export enum ProjectOption {
    H1B = 'H-1B Analytics',
    News = 'Immigrant News'
}

export function ProjectsDashboard() {
    const [activeProject, setActiveProject] = useState<ProjectOption>(ProjectOption.H1B);
    const [employerData, setEmployerData] = useState<EmployerDataFile | null>(null);
    const [selectedEmployer, setSelectedEmployer] = useState<EmployerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;
        console.log('[ProjectsDashboard] Mounting, fetching data...');

        loadEmployerData()
            .then((data) => {
                if (!isActive) return;
                console.log('[ProjectsDashboard] Data loaded, freezing complete.');
                setEmployerData(data);
                setSelectedEmployer(data.employers[0] || null);
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

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl shadow-soft p-8 flex items-center justify-center text-sm text-gray-500">
                Loading data...
            </div>
        );
    }

    if (error || !employerData) {
        return (
            <div className="bg-white rounded-3xl shadow-soft p-8 text-sm text-red-500">
                {error || 'Data unavailable.'}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div className="flex flex-col gap-3">
                    <H1BKPIHeader employerData={employerData} />
                    <ProjectSelector
                        activeProject={activeProject}
                        onProjectChange={setActiveProject}
                    />
                </div>
                {activeProject === ProjectOption.H1B && (
                    <H1BSearchHeader
                        employerData={employerData}
                        selectedEmployer={selectedEmployer}
                        onSelect={(employer) => setSelectedEmployer(employer)}
                    />
                )}
            </div>

            <div className="transition-all duration-500 ease-in-out">
                {activeProject === ProjectOption.H1B ? (
                    <H1BAnalyticsContent
                        employerData={employerData}
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
