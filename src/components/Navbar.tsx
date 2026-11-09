import React from 'react';
import { Plane, Calendar, Compass, Map, BarChart3 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'solver' | 'radar' | 'airstrip' | 'map' | 'metrics';
  setActiveTab: (tab: 'solver' | 'radar' | 'airstrip' | 'map' | 'metrics') => void;
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

        {/* Tab Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('solver')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-all ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'radar'
                ? 'bg-white text-blue-600 shadow-sm font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Radar Scope</span>
          </button>

          <button
            onClick={() => setActiveTab('airstrip')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'airstrip'
                ? 'bg-white text-blue-600 shadow-sm font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Plane className="w-4 h-4 rotate-45" />
            <span>3D Airstrip</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'map'
                ? 'bg-white text-blue-600 shadow-sm font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Airspace Map</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'metrics'
                ? 'bg-white text-blue-600 shadow-sm font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Evaluation Metrics</span>
          </button>
        </div>
      </div>
    </header>
  );
};
