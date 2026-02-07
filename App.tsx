import React, { useState } from 'react';
import { Header } from './components/Header';
// import { Sidebar } from './components/Sidebar'; // Available for future use
import { Controls, KPIHeader } from './components/Controls';
import { GlobalEntry } from './components/global-entry/GlobalEntry';
import { OpsStatus } from './components/ops-status/OpsStatus';
const ProjectsDashboard = React.lazy(() =>
  import('./components/projects/ProjectsDashboard').then((module) => ({
    default: module.ProjectsDashboard
  }))
);
// Charts available for future use:
// import { UserGrowthChart } from './components/charts/UserGrowthChart';
// import { DeviceTrafficChart } from './components/charts/DeviceTrafficChart';
// import { IncomeChart } from './components/charts/IncomeChart';
import { TabOption } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabOption>(() => {
    const saved = localStorage.getItem('quantro_active_tab');
    return (saved as TabOption) || TabOption.Users;
  });

  React.useEffect(() => {
    localStorage.setItem('quantro_active_tab', activeTab);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-bgPrimary pb-12 font-sans selection:bg-green-200">
      <div className="w-full lg:max-w-[85vw] mx-auto pt-6 px-4 sm:px-8">
        {/* Main Content Card Wrapper */}
        <div className="bg-bgPrimary rounded-none sm:rounded-3xl overflow-hidden">
          <Header />

          <main className="mt-8 px-2 sm:px-4">
            <Controls activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === TabOption.GlobalEntry ? (
              <GlobalEntry onNavigateToOpsStatus={() => setActiveTab(TabOption.OpsStatus)} />
            ) : activeTab === TabOption.OpsStatus ? (
              <OpsStatus onNavigateToGlobalEntry={() => setActiveTab(TabOption.GlobalEntry)} />
            ) : activeTab === TabOption.Projects ? (
              <React.Suspense
                fallback={
                  <div className="bg-white rounded-3xl shadow-soft p-8 text-sm text-gray-500">
                    Loading analytics module...
                  </div>
                }
              >
                <ProjectsDashboard />
              </React.Suspense>
            ) : (
              <KPIHeader />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
