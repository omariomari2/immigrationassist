import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { QuantroLogo } from './icons/QuantroLogo';
import { NavIcons } from './NavIcons';



export const Header: React.FC = () => {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between w-full py-4 px-6 gap-4 md:gap-0">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <QuantroLogo className="text-textPrimary w-6 h-6" />
        <span className="font-semibold text-lg tracking-tight">Quantro</span>
      </div>

      {/* Nav Icons Group */}
      <NavIcons />

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
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

        {/* Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-gray-200/50">
          <div className="relative">
            <img src="https://picsum.photos/64/64" alt="User" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="hidden sm:flex flex-col text-xs">
            <span className="font-semibold text-gray-900">Tuki Joshua</span>
            <span className="text-gray-400">Manager</span>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
};