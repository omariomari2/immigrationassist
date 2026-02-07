import { Search, ChevronDown, Building2 } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { EmployerData, EmployerSummary, EmployerSummaryResponse } from './types';
import { searchEmployers } from './utils';

interface CompanySelectorProps {
    summary: EmployerSummaryResponse | null;
    selectedEmployer: EmployerData | null;
    onSelect: (employer: EmployerSummary) => void;
}

export function CompanySelector({ summary, selectedEmployer, onSelect }: CompanySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [results, setResults] = useState<EmployerSummary[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 200);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        let isActive = true;
        if (!summary) {
            setResults([]);
            return () => {
                isActive = false;
            };
        }

        if (!debouncedQuery || debouncedQuery.length < 2) {
            setResults(summary.topEmployers || []);
            return () => {
                isActive = false;
            };
        }

        searchEmployers(debouncedQuery)
            .then((items) => {
                if (!isActive) return;
                setResults(items);
            })
            .catch(() => {
                if (!isActive) return;
                setResults([]);
            });

        return () => {
            isActive = false;
        };
    }, [debouncedQuery, summary]);

    // Group by first letter
    const groupedByLetter = useMemo(() => {
        return results.reduce((acc, employer) => {
            if (!employer || !employer.name) return acc;
            const firstLetter = employer.name[0]?.toUpperCase() || '#';
            if (!acc[firstLetter]) acc[firstLetter] = [];
            acc[firstLetter].push(employer);
            return acc;
        }, {} as Record<string, EmployerSummary[]>);
    }, [results]);

    return (
        <div ref={containerRef} className="relative w-full">
            <div
                onClick={() => summary && setIsOpen(!isOpen)}
                className={`group relative ${summary ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
            >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-hover:text-gray-600 transition-colors" />
                <div className="pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 w-full border border-transparent group-hover:bg-gray-100 transition-all flex items-center justify-between">
                    <span className={selectedEmployer ? 'font-medium' : 'text-gray-400'}>
                        {selectedEmployer ? selectedEmployer.name : summary ? 'Search for a company...' : 'Loading data...'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && summary && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-3 border-b border-gray-50">
                        <input
                            type="text"
                            placeholder="Type to search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black/5"
                            autoFocus
                        />
                    </div>
                    <div className="overflow-y-auto max-h-72">
                        {results.length === 0 ? (
                            <div className="p-4 text-center text-xs text-gray-400">
                                No employers found.
                            </div>
                        ) : (
                            Object.entries(groupedByLetter).map(([letter, letterEmployers]) => (
                                <div key={letter}>
                                    <div className="px-4 py-2 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider sticky top-0 backdrop-blur-sm">
                                        {letter}
                                    </div>
                                    {letterEmployers.map((employer) => (
                                        <button
                                            key={employer.name}
                                            onClick={() => {
                                                onSelect(employer);
                                                setIsOpen(false);
                                                setSearchQuery('');
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700 group-hover:text-black block">{employer.name}</span>
                                                    <span className="text-[10px] text-gray-400">{employer.city}, {employer.state}</span>
                                                </div>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${employer.approvalRate >= 90 ? 'bg-green-100 text-green-700' :
                                                    employer.approvalRate >= 80 ? 'bg-lime-100 text-lime-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {employer.approvalRate.toFixed(0)}%
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
