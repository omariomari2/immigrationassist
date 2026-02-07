import React, { useState } from 'react';
import { Header } from './components/Header';
import { Controls, KPIHeader } from './components/Controls';
import { GlobalEntry } from './components/global-entry/GlobalEntry';
import { OpsStatus } from './components/ops-status/OpsStatus';
import { UserProvider, useUser } from './components/UserContext';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { UserProfileCard } from './components/UserProfileCard';
const ProjectsDashboard = React.lazy(() =>
  import('./components/projects/ProjectsDashboard').then((module) => ({
    default: module.ProjectsDashboard
  }))
);
import { TabOption } from './types';

type AuthPage = 'login' | 'signup';

function AppContent() {
  const { isAuthenticated, isLoading } = useUser();
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  const [activeTab, setActiveTab] = useState<TabOption>(() => {
    const saved = localStorage.getItem('quantro_active_tab');
    return (saved as TabOption) || TabOption.Users;
  });

  React.useEffect(() => {
    localStorage.setItem('quantro_active_tab', activeTab);
  }, [activeTab]);

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

  return (
    <div className="min-h-screen bg-bgPrimary pb-12 font-sans selection:bg-green-200">
      <div className="w-full lg:max-w-[85vw] mx-auto pt-6 px-4 sm:px-8">
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
              <>
                <KPIHeader />
                <UserProfileCard />
              </>
            )}
          </main>
        </div>
      </div>
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

