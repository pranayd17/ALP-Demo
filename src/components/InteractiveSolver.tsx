import React, { useState } from 'react';
import { AGWOAConfig, ALPInstance } from '../types/alp';
import { Play, RotateCcw, Sliders, Loader2, Sparkles } from 'lucide-react';

interface InteractiveSolverProps {
  instance: ALPInstance;
  onSelectInstanceId: (id: number) => void;
  selectedInstanceId: number;
  config: AGWOAConfig;
  onUpdateConfig: (newConfig: Partial<AGWOAConfig>) => void;
  onRunOptimization: () => void;
  onReset: () => void;
  isOptimizing: boolean;
  currentIter: number;
}

export const InteractiveSolver: React.FC<InteractiveSolverProps> = ({
  instance,
  onSelectInstanceId,
  selectedInstanceId,
  config,
  onUpdateConfig,
  onRunOptimization,
  onReset,
  isOptimizing,
  currentIter,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm mb-6">
      {/* Top Row: Problem Selection and Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Dataset / Case Dropdown */}
        <div className="flex-1 max-w-md">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Select Airport Dataset
          </label>
          <select
            value={selectedInstanceId}
            onChange={(e) => onSelectInstanceId(parseInt(e.target.value, 10))}
            disabled={isOptimizing}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition-all"
          >
            <option value={1}>airland1 — 10 Flights (Classic Benchmark)</option>
            <option value={2}>airland2 — 15 Flights</option>
            <option value={3}>airland3 — 20 Flights</option>
            <option value={4}>airland4 — 20 Flights (Dense Windows)</option>
            <option value={5}>airland5 — 20 Flights (High Delay)</option>
            <option value={6}>airland6 — 30 Flights</option>
            <option value={7}>airland7 — 44 Flights</option>
            <option value={8}>airland8 — 50 Flights</option>
            <option value={9}>airland9 — 100 Flights (Large Airport)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:self-end">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
              showSettings
                ? 'bg-gray-100 text-gray-900 border-gray-300'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
            title="Algorithm Settings"
          >
            <Sliders className="w-4 h-4 text-gray-500" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            onClick={onReset}
            disabled={isOptimizing}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-40"
            title="Reset to Initial"
          >
            <RotateCcw className="w-4 h-4 text-gray-500" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={onRunOptimization}
            disabled={isOptimizing}
            className={`flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg text-white transition-all shadow-sm ${
              isOptimizing
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
            }`}
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Optimizing... ({currentIter}/{config.maxIter})</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Optimize Schedule</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simple Collapsible Settings Panel */}
      {showSettings && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex justify-between text-gray-600 mb-1">
              <span>Iterations (Generations):</span>
              <span className="font-semibold text-gray-900">{config.maxIter}</span>
            </div>
            <input
              type="range"
              min={50}
              max={500}
              step={25}
              value={config.maxIter}
              onChange={(e) => onUpdateConfig({ maxIter: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-gray-600 mb-1">
              <span>Whale Population Size:</span>
              <span className="font-semibold text-gray-900">{config.populationSize}</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={config.populationSize}
              onChange={(e) => onUpdateConfig({ populationSize: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};
