import React, { useState } from 'react';
import { Header } from './components/Header';
import { Chatbot } from './components/Chatbot';
import { Controls, KPIHeader } from './components/Controls';
import { GlobalEntry } from './components/global-entry/GlobalEntry';
import { OpsStatus } from './components/ops-status/OpsStatus';
import { UserProvider, useUser } from './components/UserContext';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { UserProfileCard } from './components/UserProfileCard';
import { SourceOfTruth } from './components/mega-tabs/SourceOfTruth';
import { Resources } from './components/mega-tabs/Resources';
import { TabOption, MegaTab } from './types';

const ProjectsDashboard = React.lazy(() =>
  import('./components/projects/ProjectsDashboard').then((module) => ({
    default: module.ProjectsDashboard
  }))
);

type AuthPage = 'login' | 'signup';

function AppContent() {
  const { isAuthenticated, isLoading } = useUser();
  const [authPage, setAuthPage] = useState<AuthPage>('login');

  const [activeMegaTab, setActiveMegaTab] = useState<MegaTab>(MegaTab.Dashboard);

  const [activeTab, setActiveTab] = useState<TabOption>(() => {
    const saved = localStorage.getItem('quantro_active_tab');
    return (saved as TabOption) || TabOption.Users;
  });

  React.useEffect(() => {
    localStorage.setItem('quantro_active_tab', activeTab);
  }, [activeTab]);

  const handleMegaTabChange = (tab: MegaTab) => {
    setActiveMegaTab(tab);
  };

  const handleUserClick = () => {
    setActiveMegaTab(MegaTab.Dashboard);
    setActiveTab(TabOption.Users);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bgPrimary flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-gray-300 border-t-black rounded-full animate-spin"></div>
          <p className="text-sm text-textSecondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authPage === 'login') {
      return <LoginPage onSwitchToSignup={() => setAuthPage('signup')} />;
    }
    return <SignupPage onSwitchToLogin={() => setAuthPage('login')} />;
  }

  const renderDashboardContent = () => {
    if (activeTab === TabOption.GlobalEntry) {
      return <GlobalEntry onNavigateToOpsStatus={() => setActiveTab(TabOption.OpsStatus)} onNavigateToProjects={() => setActiveTab(TabOption.Projects)} />;
    }
    if (activeTab === TabOption.OpsStatus) {
      return <OpsStatus onNavigateToGlobalEntry={() => setActiveTab(TabOption.GlobalEntry)} />;
    }
    if (activeTab === TabOption.Projects) {
      return (
        <React.Suspense
          fallback={
            <div className="bg-white rounded-3xl shadow-soft p-8 text-sm text-gray-500">
              Loading analytics module...
            </div>
          }
        >
          <ProjectsDashboard />
        </React.Suspense>
      );
    }
    return (
      <>
        <GlobalEntry onNavigateToOpsStatus={() => setActiveTab(TabOption.OpsStatus)} onNavigateToProjects={() => setActiveTab(TabOption.Projects)} showAccountInfo={true} />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-bgPrimary pb-12 font-sans selection:bg-green-200">
      <div className="w-full lg:max-w-[85vw] mx-auto pt-6 px-4 sm:px-8">
        <div className="bg-bgPrimary rounded-none sm:rounded-3xl overflow-hidden">
          <Header
            activeMegaTab={activeMegaTab}
            activeTab={activeTab}
            onMegaTabChange={handleMegaTabChange}
            onTabChange={setActiveTab}
            onUserClick={handleUserClick}
          />

          <main className="mt-8 px-2 sm:px-4">
            {activeMegaTab === MegaTab.Dashboard && (
              <>
                <Controls
                  activeTab={activeTab}
                  activeMegaTab={activeMegaTab}
                  onMegaTabChange={handleMegaTabChange}
                  onUserClick={handleUserClick}
                />
                {renderDashboardContent()}
              </>
            )}

            {activeMegaTab === MegaTab.SourceOfTruth && <SourceOfTruth
              activeMegaTab={activeMegaTab}
              activeTab={activeTab}
              onMegaTabChange={handleMegaTabChange}
              onUserClick={handleUserClick}
            />}

            {activeMegaTab === MegaTab.Resources && <Resources
              activeMegaTab={activeMegaTab}
              activeTab={activeTab}
              onMegaTabChange={handleMegaTabChange}
              onUserClick={handleUserClick}
            />}
          </main>
        </div>
      </div>
      <Chatbot />
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
