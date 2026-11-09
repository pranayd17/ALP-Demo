import React, { useState } from 'react';
import { AGWOAConfig, ALPInstance } from '../types/alp';
import {
  RotateCcw,
  Sliders,
  Loader2,
  Sparkles,
  FileSpreadsheet,
  Plus,
} from 'lucide-react';

interface InteractiveSolverProps {
  instance: ALPInstance;
  onSelectInstanceKey: (key: string) => void;
  selectedInstanceKey: string;
  config: AGWOAConfig;
  onUpdateConfig: (newConfig: Partial<AGWOAConfig>) => void;
  onRunOptimization: () => void;
  onReset: () => void;
  isOptimizing: boolean;
  currentIter: number;
  onOpenDatasetModal: () => void;
  // Backward compatibility fallback
  onSelectInstanceId?: (id: number) => void;
  selectedInstanceId?: number;
}

export const InteractiveSolver: React.FC<InteractiveSolverProps> = ({
  instance,
  onSelectInstanceKey,
  selectedInstanceKey,
  config,
  onUpdateConfig,
  onRunOptimization,
  onReset,
  isOptimizing,
  currentIter,
  onOpenDatasetModal,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm mb-6">
      {/* Top Row: Problem Selection and Main Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Dataset / Case Dropdown and Quick Action */}
        <div className="flex-1 max-w-xl">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Airport Dataset & Traffic Scenario
            </label>
            <div className="text-[11px] text-gray-500 font-mono flex items-center gap-1.5">
              <span>{instance.n} Aircraft</span>
              <span>·</span>
              <span>{instance.category === 'hub' ? 'Commercial Hub' : instance.category === 'custom' ? 'Custom' : 'OR-Lib'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedInstanceKey}
              onChange={(e) => onSelectInstanceKey(e.target.value)}
              disabled={isOptimizing}
              className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition-all font-medium truncate"
            >
              <optgroup label="Real-World Airport Hubs (Commercial Flights)">
                <option value="hub_del">Indira Gandhi (DEL) — 25 Flights (Peak Arrival Bank)</option>
                <option value="hub_bom">Chhatrapati Shivaji (BOM) — 35 Flights (Single-Runway Rush)</option>
                <option value="hub_lhr">London Heathrow (LHR) — 30 Flights (Widebody Bank)</option>
                <option value="hub_jfk">New York JFK — 28 Flights (Transatlantic Inbound)</option>
              </optgroup>

              <optgroup label="OR-Library Academic Benchmarks (Beasley)">
                <option value="airland1">airland1 — 10 Flights (Classic Benchmark)</option>
                <option value="airland2">airland2 — 15 Flights</option>
                <option value="airland3">airland3 — 20 Flights</option>
                <option value="airland4">airland4 — 20 Flights (Dense Windows)</option>
                <option value="airland5">airland5 — 20 Flights (High Delay)</option>
                <option value="airland6">airland6 — 30 Flights</option>
                <option value="airland7">airland7 — 44 Flights</option>
                <option value="airland8">airland8 — 50 Flights</option>
                <option value="airland9">airland9 — 100 Flights (Large Airport)</option>
              </optgroup>

              {instance.category === 'custom' && (
                <optgroup label="Custom / Uploaded Schedule">
                  <option value={selectedInstanceKey}>
                    {instance.name}
                  </option>
                </optgroup>
              )}
            </select>

            <button
              onClick={onOpenDatasetModal}
              disabled={isOptimizing}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all shrink-0 disabled:opacity-50"
              title="Upload custom flight CSV or generate a custom airport scenario"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Import CSV / Generator</span>
              <span className="sm:hidden">Import</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 lg:self-end">
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

      {/* Description subtitle */}
      <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-500">
        <span className="truncate max-w-xl">{instance.description}</span>
        {instance.airportCode && (
          <span className="font-mono text-[11px] text-gray-400">
            ICAO/IATA: {instance.airportCode}
          </span>
        )}
      </div>

      {/* Simple Collapsible Settings Panel */}
      {showSettings && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex justify-between text-gray-600 mb-1">
              <span>Iterations (Generations):</span>
              <span className="font-semibold text-gray-900 font-mono tabular-nums">{config.maxIter}</span>
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
              <span className="font-semibold text-gray-900 font-mono tabular-nums">{config.populationSize}</span>
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
