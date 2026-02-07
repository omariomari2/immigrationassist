import React, { useMemo } from 'react';
import { EmployerDataFile } from './types';
import { getTotalFilingsForYear } from './utils';

interface H1BKPIHeaderProps {
    employerData: EmployerDataFile;
}

export function H1BKPIHeader({ employerData }: H1BKPIHeaderProps) {
    const latestYear = useMemo(() => {
        const range = employerData.metadata?.yearRange || '';
        const match = range.match(/(\d{4})\s*-\s*(\d{4})/);
        if (match) {
            return Number(match[2]);
        }

        let maxYear = 0;
        for (const employer of employerData.employers) {
            for (const entry of employer.yearlyHistory) {
                if (entry.year > maxYear) {
                    maxYear = entry.year;
                }
            }
        }
        return maxYear || new Date().getFullYear();
    }, [employerData]);

    const totalFilings = useMemo(() => {
        return getTotalFilingsForYear(employerData, latestYear);
    }, [employerData, latestYear]);

    const formatted = totalFilings.toLocaleString();
    const parts = formatted.split(',');
    const mainPart = parts.slice(0, -1).join(',');
    const lastPart = parts[parts.length - 1];

    return (
        <div className="flex flex-col gap-1">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Work Visas Filed in {latestYear}</h3>
            <div className="text-6xl sm:text-7xl font-semibold tracking-tight text-gray-800 leading-none">
                {mainPart},{mainPart ? <span className="text-gray-400/80">{lastPart}</span> : formatted}
            </div>
        </div>
    );
}
