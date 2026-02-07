import React from 'react';
import { MegaTab, TabOption } from '../types';
import { Calendar, RefreshCw, ChevronDown } from 'lucide-react';
import { NavIcons } from './NavIcons';
import { PageHeader } from './PageHeader';

interface ControlsProps {
  activeTab: TabOption;
  activeMegaTab: MegaTab;
  onMegaTabChange: (tab: MegaTab) => void;
  onUserClick: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ activeMegaTab, activeTab, onMegaTabChange, onUserClick }) => {
  return (
    <div className="flex flex-col gap-6 mb-8">
      <PageHeader
        title="Overview"
        breadcrumbs={
          <div className="flex items-center gap-2 text-xs text-textTertiary">
            <span className="w-2 h-2 bg-gray-300 rounded-sm"></span>
            <span>Immigration hub</span>
            <span className="text-gray-300">/</span>
            <span className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></span>
            <span className="font-medium text-gray-500">Traffic</span>
          </div>
        }
        activeMegaTab={activeMegaTab}
        activeTab={activeTab}
        onMegaTabChange={onMegaTabChange}
        onUserClick={onUserClick}
      />
    </div>
  );
};

import { useUser } from './UserContext';
import { calculateVisaCountdown } from '../utils/dateUtils';

export const KPIHeader: React.FC = () => {
  const { user } = useUser();
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Guest';

  let headerTitle = "Welcome back";
  let headerValue = userName;
  let subValue = null;

  if (user?.visaExpirationDate) {
    headerTitle = "Visa Expiration Countdown";
    headerValue = calculateVisaCountdown(user.visaExpirationDate);
    // If it returns a string like "X Months, Y Days", we display that.
    // If "Expired", we display that.
  }

  return (
    <div className="flex flex-col gap-1 mb-8">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{headerTitle}</h3>
          <div className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-800 leading-none">
            {headerValue}
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <button className="p-2 bg-white rounded-lg text-gray-400 hover:text-gray-600 shadow-sm transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition-colors group">
            <Calendar className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
            <span>Nov 1' 24 - Dec 1' 24</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
