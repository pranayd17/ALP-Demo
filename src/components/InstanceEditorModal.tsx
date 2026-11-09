import React, { useState, useRef } from 'react';
import { ALPInstance, Aircraft, ScenarioGeneratorConfig } from '../types/alp';
import {
  REAL_WORLD_HUBS,
  generateCustomScenario,
  parseCSVToALPInstance,
  getSampleCSVContent,
  buildHubDEL,
  buildHubBOM,
  buildHubLHR,
  buildHubJFK,
  buildICAOSeparationMatrix,
} from '../data/benchmarkData';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  Sliders,
  Plane,
  AlertCircle,
  CheckCircle2,
  Building2,
  FileText,
  Layers,
} from 'lucide-react';

interface DatasetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadInstance: (instance: ALPInstance) => void;
  currentInstanceId?: string;
}

export const InstanceEditorModal: React.FC<DatasetManagerModalProps> = ({
  isOpen,
  onClose,
  onLoadInstance,
  currentInstanceId,
}) => {
  const [activeTab, setActiveTab] = useState<'hubs' | 'csv' | 'generator' | 'orlib'>('hubs');

  // CSV Upload State
  const [dragActive, setDragActive] = useState(false);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [parsedPreviewInstance, setParsedPreviewInstance] = useState<ALPInstance | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Scenario Generator State
  const [airportPreset, setAirportPreset] = useState<'DEL' | 'BOM' | 'LHR' | 'JFK' | 'SIN' | 'DXB' | 'CUSTOM'>('DEL');
  const [airportName, setAirportName] = useState('Indira Gandhi International');
  const [airportCode, setAirportCode] = useState('DEL');
  const [aircraftCount, setAircraftCount] = useState<number>(25);
  const [trafficDensity, setTrafficDensity] = useState<'low' | 'medium' | 'high'>('high');
  const [heavyPct, setHeavyPct] = useState<number>(30);
  const [mediumPct, setMediumPct] = useState<number>(60);
  const [lightPct, setLightPct] = useState<number>(10);

  // Raw OR-Lib text
  const [rawText, setRawText] = useState('');
  const [orlibError, setOrlibError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Preset Airport change for Generator
  const handleAirportPresetChange = (preset: 'DEL' | 'BOM' | 'LHR' | 'JFK' | 'SIN' | 'DXB' | 'CUSTOM') => {
    setAirportPreset(preset);
    if (preset === 'DEL') {
      setAirportName('Indira Gandhi International');
      setAirportCode('DEL');
    } else if (preset === 'BOM') {
      setAirportName('Chhatrapati Shivaji Maharaj');
      setAirportCode('BOM');
    } else if (preset === 'LHR') {
      setAirportName('London Heathrow');
      setAirportCode('LHR');
    } else if (preset === 'JFK') {
      setAirportName('John F. Kennedy International');
      setAirportCode('JFK');
    } else if (preset === 'SIN') {
      setAirportName('Singapore Changi Airport');
      setAirportCode('SIN');
    } else if (preset === 'DXB') {
      setAirportName('Dubai International');
      setAirportCode('DXB');
    } else {
      setAirportName('Custom Regional Airport');
      setAirportCode('AIR');
    }
  };

  // CSV File Handler
  const handleFileProcess = (file: File) => {
    setCsvError(null);
    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        setCsvContent(text);
        const parsed = parseCSVToALPInstance(text, file.name.replace(/\.[^/.]+$/, ''));
        setParsedPreviewInstance(parsed);
      } catch (err: any) {
        setCsvError(err.message || 'Error parsing CSV file');
        setParsedPreviewInstance(null);
      }
    };
    reader.onerror = () => {
      setCsvError('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  // Download Sample CSV
  const handleDownloadTemplate = () => {
    const content = getSampleCSVContent();
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'alp_flight_schedule_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick load sample CSV into parser
  const handleLoadSampleCSV = () => {
    const sample = getSampleCSVContent();
    setCsvFileName('sample_delhi_flights.csv');
    setCsvContent(sample);
    try {
      const parsed = parseCSVToALPInstance(sample, 'Sample Delhi Airport Flight Schedule (12 Aircraft)');
      setParsedPreviewInstance(parsed);
      setCsvError(null);
    } catch (err: any) {
      setCsvError(err.message);
    }
  };

  // Confirm loading the CSV
  const handleConfirmCSVLoad = () => {
    if (parsedPreviewInstance) {
      onLoadInstance(parsedPreviewInstance);
      onClose();
    }
  };

  // Handle Scenario Generation
  const handleGenerateScenario = () => {
    const cfg: ScenarioGeneratorConfig = {
      airportName,
      airportCode,
      aircraftCount,
      trafficDensity,
      heavyRatio: heavyPct,
      mediumRatio: mediumPct,
      lightRatio: lightPct,
    };
    const inst = generateCustomScenario(cfg);
    onLoadInstance(inst);
    onClose();
  };

  // Parse Raw OR-Lib text format
  const handleParseRawText = () => {
    try {
      setOrlibError(null);
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
        id: `orlib_custom_${Date.now()}`,
        name: `Imported OR-Lib (${n} Aircraft)`,
        n,
        freeze_time: freeze,
        aircraft,
        separation,
        description: `Custom OR-Library text file with ${n} aircraft and freeze time ${freeze}s.`,
        isBenchmark: true,
        category: 'orlib',
      };

      onLoadInstance(inst);
      onClose();
    } catch (err: any) {
      setOrlibError(err.message || 'Failed to parse OR-Library formatted input.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Airport Datasets & Flight Generator
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Switch between real-world hub schedules, upload custom flight CSVs, or generate test scenarios.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50/80 px-6 pt-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('hubs')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'hubs'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>Real-World Airport Hubs</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'csv'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Upload Flight CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'generator'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Scenario Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('orlib')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'orlib'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Raw OR-Lib Format</span>
          </button>
        </div>

        {/* Modal Body with Scroll */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Real-World Hub Presets */}
          {activeTab === 'hubs' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Curated Commercial Airport Hub Datasets
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  High-density arrival waves at major commercial airports with authentic airline callsigns and ICAO wake turbulence separation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {REAL_WORLD_HUBS.map((hub) => {
                  const isCurrent = currentInstanceId === hub.id;
                  const heavyCount = hub.aircraft.filter((a) => a.category === 'Heavy').length;
                  const mediumCount = hub.aircraft.filter((a) => a.category === 'Medium').length;
                  const lightCount = hub.aircraft.filter((a) => a.category === 'Light').length;

                  return (
                    <div
                      key={hub.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                              {hub.airportCode || hub.id}
                            </span>
                            <span className="text-xs text-gray-500">{hub.city}</span>
                          </div>
                          <span className="text-xs font-mono font-semibold text-blue-600 tabular-nums">
                            {hub.n} Flights
                          </span>
                        </div>

                        <h5 className="font-semibold text-gray-900 text-sm mt-2 leading-tight">
                          {hub.name}
                        </h5>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {hub.description}
                        </p>

                        {/* Metadata summary (Unboxed, pure typography) */}
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono mt-3">
                          <span>Heavy: {heavyCount}</span>
                          <span>·</span>
                          <span>Medium: {mediumCount}</span>
                          <span>·</span>
                          <span>Light: {lightCount}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[11px] text-gray-400 font-mono">
                          Freeze: {hub.freeze_time}s
                        </span>
                        <button
                          onClick={() => {
                            onLoadInstance(hub);
                            onClose();
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            isCurrent
                              ? 'bg-blue-600 text-white cursor-default'
                              : 'bg-gray-900 text-white hover:bg-blue-600'
                          }`}
                        >
                          {isCurrent ? 'Active Dataset' : 'Load Dataset'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Upload CSV */}
          {activeTab === 'csv' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    Import Custom Flights from CSV
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Upload your own flight arrival schedule or use the included sample template.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                    <span>Download Template</span>
                  </button>
                  <button
                    onClick={handleLoadSampleCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <span>Load Sample Data</span>
                  </button>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-gray-700">
                  {csvFileName ? (
                    <span className="text-blue-600 font-mono">{csvFileName}</span>
                  ) : (
                    <>Click to choose a CSV file or drag and drop here</>
                  )}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Supports columns: <code className="font-mono text-gray-700">callsign, category, target</code> or full ALP parameters
                </p>
              </div>

              {/* Error display */}
              {csvError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{csvError}</span>
                </div>
              )}

              {/* Parsed Preview */}
              {parsedPreviewInstance && (
                <div className="space-y-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-gray-900">
                        Successfully parsed {parsedPreviewInstance.n} flights
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">
                      Time Horizon: {Math.round(parsedPreviewInstance.aircraft[0]?.earliest || 0)}s – {Math.round(parsedPreviewInstance.aircraft[parsedPreviewInstance.n - 1]?.latest || 0)}s
                    </span>
                  </div>

                  {/* Summary Breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-white rounded-lg border border-gray-200">
                      <div className="text-gray-500 text-[10px]">Heavy</div>
                      <div className="font-bold text-gray-900 font-mono">
                        {parsedPreviewInstance.aircraft.filter((a) => a.category === 'Heavy').length}
                      </div>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-gray-200">
                      <div className="text-gray-500 text-[10px]">Medium</div>
                      <div className="font-bold text-gray-900 font-mono">
                        {parsedPreviewInstance.aircraft.filter((a) => a.category === 'Medium').length}
                      </div>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-gray-200">
                      <div className="text-gray-500 text-[10px]">Light</div>
                      <div className="font-bold text-gray-900 font-mono">
                        {parsedPreviewInstance.aircraft.filter((a) => a.category === 'Light').length}
                      </div>
                    </div>
                  </div>

                  {/* Flights Preview Table */}
                  <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100 text-gray-600 font-semibold sticky top-0">
                        <tr>
                          <th className="py-1.5 px-3">Callsign</th>
                          <th className="py-1.5 px-3">Category</th>
                          <th className="py-1.5 px-3">Target Time</th>
                          <th className="py-1.5 px-3">Window [E, L]</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                        {parsedPreviewInstance.aircraft.slice(0, 6).map((a) => (
                          <tr key={a.id} className="hover:bg-gray-50">
                            <td className="py-1.5 px-3 font-semibold text-gray-800">{a.callsign}</td>
                            <td className="py-1.5 px-3 text-gray-600">{a.category}</td>
                            <td className="py-1.5 px-3 text-gray-800 tabular-nums">{a.target}s</td>
                            <td className="py-1.5 px-3 text-gray-500 tabular-nums">[{a.earliest}s, {a.latest}s]</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleConfirmCSVLoad}
                      className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                    >
                      Load {parsedPreviewInstance.n} Flights into Optimizer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Scenario Generator */}
          {activeTab === 'generator' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Parametric Traffic & Wake Congestion Generator
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Synthesize high-stress arrival banks with adjustable airport hub characteristics and wake separation mixes.
                </p>
              </div>

              {/* Preset Airport Quick Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Airport Template
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-xs font-mono">
                  {(['DEL', 'BOM', 'LHR', 'JFK', 'SIN', 'DXB', 'CUSTOM'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => handleAirportPresetChange(p)}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-colors font-semibold ${
                        airportPreset === p
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Airport Facility Name
                  </label>
                  <input
                    type="text"
                    value={airportName}
                    onChange={(e) => setAirportName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    IATA Airport Code
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={airportCode}
                    onChange={(e) => setAirportCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-700">
                      Aircraft Count (N)
                    </label>
                    <span className="text-xs font-mono font-bold text-blue-600 tabular-nums">
                      {aircraftCount} flights
                    </span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={80}
                    step={1}
                    value={aircraftCount}
                    onChange={(e) => setAircraftCount(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                    <span>8 flights</span>
                    <span>40 flights</span>
                    <span>80 flights</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Traffic Congestion Mode
                  </label>
                  <select
                    value={trafficDensity}
                    onChange={(e) => setTrafficDensity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Relaxed Spacing (Spacious 20s gaps)</option>
                    <option value="medium">Standard Congestion (14s gaps)</option>
                    <option value="high">Peak Rush Hour (Tight 9s intervals & conflicts)</option>
                  </select>
                </div>
              </div>

              {/* Wake Category Proportions */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-800">
                    Wake Turbulence Mix
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    Heavy {heavyPct}% · Medium {mediumPct}% · Light {lightPct}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">Heavy (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={heavyPct}
                      onChange={(e) => setHeavyPct(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs font-mono text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">Medium (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={mediumPct}
                      onChange={(e) => setMediumPct(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs font-mono text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">Light (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={lightPct}
                      onChange={(e) => setLightPct(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs font-mono text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleGenerateScenario}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                >
                  Generate & Activate Scenario
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Raw OR-Lib Text */}
          {activeTab === 'orlib' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Import Beasley OR-Library Raw Text File
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Paste the content of any classic OR-Lib benchmark file (e.g. <code className="font-mono text-gray-700">airland*.txt</code>).
                </p>
              </div>

              <textarea
                rows={8}
                placeholder={`Format:\nn freeze_time\nFor each aircraft i:\n  arrival earliest target latest early_penalty late_penalty\n  sep[i, 0] ... sep[i, n-1]`}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {orlibError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{orlibError}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleParseRawText}
                  disabled={!rawText.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
                >
                  Parse & Load Instance
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
