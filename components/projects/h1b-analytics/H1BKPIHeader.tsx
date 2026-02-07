import React, { useMemo } from 'react';
import { EmployerSummaryResponse } from './types';

interface H1BKPIHeaderProps {
    summary: EmployerSummaryResponse;
}

export function H1BKPIHeader({ summary }: H1BKPIHeaderProps) {
    const latestYear = useMemo(() => {
        const range = summary.metadata?.yearRange || '';
        const match = range.match(/(\d{4})\s*-\s*(\d{4})/);
        if (match) {
            return Number(match[2]);
        }
        return summary.latestYear || new Date().getFullYear();
    }, [summary]);

    const totalFilings = useMemo(() => {
        return summary.totalFilingsLatestYear || 0;
    }, [summary, latestYear]);

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
