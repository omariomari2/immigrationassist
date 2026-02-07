import { Search, ChevronDown, Building2 } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { EmployerData, searchEmployers } from '../data/employerData';

interface CompanySelectorProps {
  selectedEmployer: EmployerData | null;
  onSelect: (employer: EmployerData) => void;
}

export function CompanySelector({ selectedEmployer, onSelect }: CompanySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredEmployers = useMemo(() => {
    return searchEmployers(searchQuery);
  }, [searchQuery]);

  // Group by first letter for organization
  const groupedByLetter = useMemo(() => {
    return filteredEmployers.reduce((acc, employer) => {
      const firstLetter = employer.name[0]?.toUpperCase() || '#';
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(employer);
      return acc;
    }, {} as Record<string, EmployerData[]>);
  }, [filteredEmployers]);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Search Employer (H1B Sponsor)
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-blue-600" />
          <span className={selectedEmployer ? 'text-gray-900' : 'text-gray-500'}>
            {selectedEmployer ? selectedEmployer.name : 'Search for a company...'}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies (e.g., Google, Microsoft)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-72">
            {filteredEmployers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No employers found. Try a different search.
              </div>
            ) : (
              Object.entries(groupedByLetter).map(([letter, letterEmployers]) => (
                <div key={letter}>
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:outline-none focus:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-900 font-medium block">{employer.name}</span>
                          <span className="text-xs text-gray-500">{employer.city}, {employer.state} • {employer.totalCases.toLocaleString()} H1B cases</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          employer.approvalRate >= 90 ? 'bg-green-100 text-green-800' :
                          employer.approvalRate >= 80 ? 'bg-lime-100 text-lime-800' :
                          employer.approvalRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {employer.approvalRate.toFixed(1)}%
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
