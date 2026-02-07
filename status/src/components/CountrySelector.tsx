import { Search, ChevronDown, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { CountryData } from '../data/visaData';

interface CountrySelectorProps {
  countries: CountryData[];
  selectedCountry: CountryData | null;
  onSelect: (country: CountryData) => void;
}

export function CountrySelector({ countries, selectedCountry, onSelect }: CountrySelectorProps) {
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

  const filteredCountries = countries
    .filter(c => c.country.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.country.localeCompare(b.country));

  // Group by region
  const groupedByRegion = filteredCountries.reduce((acc, country) => {
    if (!acc[country.region]) acc[country.region] = [];
    acc[country.region].push(country);
    return acc;
  }, {} as Record<string, CountryData[]>);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Your Nationality
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-blue-600" />
          <span className={selectedCountry ? 'text-gray-900' : 'text-gray-500'}>
            {selectedCountry ? selectedCountry.country : 'Choose a country...'}
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
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-72">
            {Object.entries(groupedByRegion).map(([region, regionCountries]) => (
              <div key={region}>
                <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {region}
                </div>
                {regionCountries.map((country) => (
                  <button
                    key={country.countryCode}
                    onClick={() => {
                      onSelect(country);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:outline-none focus:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">{country.country}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        country.refusalRate < 15 ? 'bg-green-100 text-green-800' :
                        country.refusalRate < 30 ? 'bg-yellow-100 text-yellow-800' :
                        country.refusalRate < 50 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {country.refusalRate.toFixed(1)}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
