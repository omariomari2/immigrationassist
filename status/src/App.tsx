import { useState, useMemo } from 'react';
import { Building2, Search, Info, ExternalLink } from 'lucide-react';
import { CompanySelector } from './components/CompanySelector';
import { H1BStatsChart } from './components/H1BStatsChart';
import { CompanyDetailsPanel } from './components/CompanyDetailsPanel';
import { OpportunitiesPanel } from './components/OpportunitiesPanel';
import { TrendChart } from './components/TrendChart';
import { ChatWidget } from './components/ChatWidget';
import { employerData, EmployerData } from './data/employerData';

function App() {
  const [selectedEmployer, setSelectedEmployer] = useState<EmployerData>(employerData.employers[0]);

  const topEmployers = useMemo(() => {
    return employerData.employers.slice(0, 10);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-8 h-8" />
            <h1 className="text-2xl sm:text-3xl font-bold">H1B Sponsor Insights</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-3xl">
            Analyze H1B visa approval rates for US employers. 
            Make informed decisions about your career and sponsorship opportunities.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Selector */}
        <div className="mb-8">
          <CompanySelector
            selectedEmployer={selectedEmployer}
            onSelect={setSelectedEmployer}
          />
        </div>

        {/* Top Employers Quick Links */}
        <div className="mb-8 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Search className="w-4 h-4" />
            Popular H1B Sponsors
          </div>
          <div className="flex flex-wrap gap-2">
            {topEmployers.map((emp) => (
              <button
                key={emp.name}
                onClick={() => setSelectedEmployer(emp)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  selectedEmployer.name === emp.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {emp.name.slice(0, 25)}{emp.name.length > 25 ? '...' : ''}
              </button>
            ))}
          </div>
        </div>

        {selectedEmployer && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              <H1BStatsChart employer={selectedEmployer} />
              <TrendChart employer={selectedEmployer} />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <CompanyDetailsPanel employer={selectedEmployer} />
              <OpportunitiesPanel employer={selectedEmployer} />
              
              {/* Information Box */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Understanding H1B Data
                    </h3>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      H1B approval rates vary significantly by employer based on their 
                      legal preparation, job category, and candidate qualifications. 
                      This data shows historical USCIS decisions but does not guarantee 
                      future outcomes. Always consult with an immigration attorney 
                      for personalized advice.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Source */}
              <div className="text-center">
                <a 
                  href="https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  Data source: USCIS H-1B Employer Data Hub
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-xs text-gray-400 mt-1">
                  Covers fiscal years 2020-2025 • {employerData.metadata.totalEmployers.toLocaleString()} employers tracked
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-center">
            This tool provides estimates based on historical USCIS data and does not guarantee visa outcomes. 
            Always consult official USCIS resources and qualified immigration attorneys.
          </p>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget onSelectCompany={setSelectedEmployer} />
    </div>
  );
}

export default App;
