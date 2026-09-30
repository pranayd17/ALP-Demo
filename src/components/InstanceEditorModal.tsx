import React, { useState } from 'react';
import { ALPInstance, Aircraft } from '../types/alp';
import { createCustomInstance } from '../data/benchmarkData';
import { X, AlertCircle } from 'lucide-react';

interface InstanceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadInstance: (instance: ALPInstance) => void;
}

export const InstanceEditorModal: React.FC<InstanceEditorModalProps> = ({
  isOpen,
  onClose,
  onLoadInstance,
}) => {
  const [activeTab, setActiveTab] = useState<'generator' | 'rawText'>('generator');

  // Generator inputs
  const [customName, setCustomName] = useState('Custom Airspace Test');
  const [aircraftCount, setAircraftCount] = useState<number>(12);
  const [density, setDensity] = useState<'low' | 'medium' | 'high'>('medium');

  // Raw text import
  const [rawText, setRawText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = () => {
    const inst = createCustomInstance(customName, aircraftCount, density);
    onLoadInstance(inst);
    onClose();
  };

  const handleParseRawText = () => {
    try {
      setParseError(null);
      const tokens = rawText.trim().split(/\s+/);
      if (tokens.length < 2) {
        throw new Error('File contains insufficient tokens. Expected at least: n, freeze_time');
      }

      let k = 0;
      const n = parseInt(tokens[k++], 10);
      const freeze = parseFloat(tokens[k++]);

      if (isNaN(n) || n <= 0) {
        throw new Error('Invalid number of aircraft: ' + n);
      }

      const aircraft: Aircraft[] = [];
      const separation: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

      const categories: ('Heavy' | 'Medium' | 'Light')[] = ['Heavy', 'Medium', 'Light'];

      for (let i = 0; i < n; i++) {
        if (k + 6 > tokens.length) {
          throw new Error(`Unexpected end of file while reading aircraft #${i + 1}`);
        }

        const arrival = parseFloat(tokens[k++]);
        const earliest = parseFloat(tokens[k++]);
        const target = parseFloat(tokens[k++]);
        const latest = parseFloat(tokens[k++]);
        const earlyPen = parseFloat(tokens[k++]);
        const latePen = parseFloat(tokens[k++]);

        aircraft.push({
          id: i,
          callsign: `FL-${String(i + 1).padStart(3, '0')}`,
          category: categories[i % categories.length],
          arrival,
          earliest,
          target,
          latest,
          early_penalty: earlyPen,
          late_penalty: latePen,
        });

        if (k + n > tokens.length) {
          throw new Error(`Unexpected end of file while reading separation matrix row #${i + 1}`);
        }

        for (let j = 0; j < n; j++) {
          separation[i][j] = parseFloat(tokens[k++]);
        }
      }

      const inst: ALPInstance = {
        id: `imported_${Date.now()}`,
        name: `Imported OR-Lib (${n} Aircraft)`,
        n,
        freeze_time: freeze,
        aircraft,
        separation,
        description: `Imported OR-Library instance parsed with ${n} aircraft and freeze time ${freeze}s.`,
        isBenchmark: false,
      };

      onLoadInstance(inst);
      onClose();
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse OR-Library formatted input.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Custom Airspace Instance Creator & Importer
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate synthetic traffic instances or load OR-Library benchmark text files.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-2 border-b-2 font-semibold transition-colors ${
              activeTab === 'generator'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Airspace Traffic Generator
          </button>
          <button
            onClick={() => setActiveTab('rawText')}
            className={`px-4 py-2 border-b-2 font-semibold transition-colors ${
              activeTab === 'rawText'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Import OR-Lib Text Format
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5">
          {activeTab === 'generator' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-600 mb-1">
                  Instance Title / Label
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-600 mb-1">
                    Aircraft Count (N)
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={60}
                    value={aircraftCount}
                    onChange={(e) => setAircraftCount(Math.max(4, parseInt(e.target.value, 10) || 4))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-600 mb-1">
                    Traffic Density
                  </label>
                  <select
                    value={density}
                    onChange={(e) => setDensity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="low">Low (Spacious Spacing)</option>
                    <option value="medium">Medium (Standard Arrival Flow)</option>
                    <option value="high">High (Peak Congestion & Tight Windows)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
                <span className="text-sky-700 font-semibold block mb-1">AUTOMATIC PROFILE:</span>
                Synthesizes realistic arrival times, time windows [E, T, L], Heavy/Medium/Light wake vortex separation matrices, and delay penalty weights.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-xs"
                >
                  Create & Load Instance
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-600 mb-1">
                  Paste Raw OR-Library File Content
                </label>
                <textarea
                  rows={8}
                  placeholder={`Format:\nn freeze_time\nFor each aircraft i:\n  arrival earliest target latest early_penalty late_penalty\n  sep[i, 0] ... sep[i, n-1]`}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              {parseError && (
                <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs font-mono text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{parseError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleParseRawText}
                  disabled={!rawText.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
                >
                  Parse & Load
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
