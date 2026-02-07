import React, { useState } from 'react';
import { Search, Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { QuantroLogo } from './icons/QuantroLogo';
import { NavIcons } from './NavIcons';
import { useUser } from './UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MegaTab, TabOption } from '../types';

interface HeaderProps {
  activeMegaTab: MegaTab;
  activeTab: TabOption;
  onMegaTabChange: (tab: MegaTab) => void;
  onUserClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeMegaTab, activeTab, onMegaTabChange, onUserClick }) => {
  const { user, logout } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);

  const displayName = user ? `\${user.firstName} \${user.lastName}` : 'Guest';
  const displayRole = user?.visaStatus || 'User';

  return (
    <header className="flex flex-col md:flex-row items-center justify-between w-full py-4 px-6 gap-4 md:gap-0">
      <div className="flex items-center gap-2">
        <QuantroLogo className="text-textPrimary w-6 h-6" />
        <span className="font-semibold text-lg tracking-tight">Immigration</span>
      </div>

      <NavIcons
        activeMegaTab={activeMegaTab}
        activeTab={activeTab}
        onMegaTabChange={onMegaTabChange}
        onUserClick={onUserClick}
      />

      <div className="flex items-center gap-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-gray-600" />
          <input
            type="text"
            placeholder="Search Dashboard"
            className="pl-9 pr-4 py-2 bg-white rounded-lg text-sm text-gray-700 w-64 shadow-sm border border-transparent focus:border-gray-200 focus:outline-none transition-all placeholder:text-gray-300"
          />
        </div>

        <button className="p-2 bg-white rounded-lg shadow-sm text-gray-600 hover:text-gray-900 transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        <div className="relative flex items-center gap-3 pl-2 border-l border-gray-200/50">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="hidden sm:flex flex-col text-xs">
            <span className="font-semibold text-gray-900">{displayName}</span>
            <span className="text-gray-400">{displayRole}</span>
          </div>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-soft py-2 z-50"
              >
                <button
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};