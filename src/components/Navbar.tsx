import React from 'react';
import { Plane, Calendar, Compass } from 'lucide-react';

interface NavbarProps {
  activeTab: 'solver' | 'radar';
  setActiveTab: (tab: 'solver' | 'radar') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* App Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
              Airplane Landing Scheduler
            </h1>
            <p className="text-xs text-gray-500">
              AGWOA Algorithm · Aircraft Landing Problem
            </p>
          </div>
        </div>

        {/* Simple Tab Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setActiveTab('solver')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
              activeTab === 'solver'
                ? 'bg-white text-blue-600 shadow-sm font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule & Solver</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
              activeTab === 'radar'
                ? 'bg-white text-blue-600 shadow-sm font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Radar & Approach View</span>
          </button>
        </div>
      </div>
    </header>
  );
};
