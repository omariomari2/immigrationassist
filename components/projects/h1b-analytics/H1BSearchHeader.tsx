import React from 'react';
import { CompanySelector } from './CompanySelector';
import { EmployerData, EmployerDataFile } from './types';

interface H1BSearchHeaderProps {
    employerData: EmployerDataFile | null;
    selectedEmployer: EmployerData | null;
    onSelect: (employer: EmployerData) => void;
}

export function H1BSearchHeader({ employerData, selectedEmployer, onSelect }: H1BSearchHeaderProps) {
    return (
        <div className="w-full md:max-w-md">
            <CompanySelector
                employerData={employerData}
                selectedEmployer={selectedEmployer}
                onSelect={onSelect}
            />
        </div>
    );
}
