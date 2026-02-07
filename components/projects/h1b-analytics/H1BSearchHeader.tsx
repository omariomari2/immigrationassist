import React from 'react';
import { CompanySelector } from './CompanySelector';
import { EmployerData, EmployerSummary, EmployerSummaryResponse } from './types';

interface H1BSearchHeaderProps {
    summary: EmployerSummaryResponse | null;
    selectedEmployer: EmployerData | null;
    onSelect: (employer: EmployerSummary) => void;
}

export function H1BSearchHeader({ summary, selectedEmployer, onSelect }: H1BSearchHeaderProps) {
    return (
        <div className="w-full md:max-w-md">
            <CompanySelector
                summary={summary}
                selectedEmployer={selectedEmployer}
                onSelect={onSelect}
            />
        </div>
    );
}
