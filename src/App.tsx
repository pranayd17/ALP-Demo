import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  ALPInstance,
  Evaluation,
  AGWOAConfig,
  ScheduledAircraft,
} from './types/alp';
import {
  buildORLibInstance,
} from './data/benchmarkData';
import { ALPEvaluator } from './algorithms/alpEvaluator';
import { AGWOAOptimizer, DEFAULT_AGWOA_CONFIG } from './algorithms/agwoa';
import { Navbar } from './components/Navbar';
import { MetricCards } from './components/MetricCards';
import { InteractiveSolver } from './components/InteractiveSolver';
import { RadarScope } from './components/RadarScope';
import { RunwayTimeline } from './components/RunwayTimeline';
import { ScheduleTable } from './components/ScheduleTable';
import { AirstripLandingView } from './components/AirstripLandingView';
import { AirspaceMapView } from './components/AirspaceMapView';
import { EvaluationMetricsView } from './components/EvaluationMetricsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'solver' | 'radar' | 'airstrip' | 'map' | 'metrics'>('solver');
  const [selectedInstanceId, setSelectedInstanceId] = useState<number>(1);
  const [currentInstance, setCurrentInstance] = useState<ALPInstance>(() => buildORLibInstance(1));
  const [config, setConfig] = useState<AGWOAConfig>({ ...DEFAULT_AGWOA_CONFIG, seed: 43 });

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [currentIter, setCurrentIter] = useState<number>(0);
  const [runtimeSeconds, setRuntimeSeconds] = useState<number>(0);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  const optimizerRef = useRef<AGWOAOptimizer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Initialize solver with current instance
  const initializeSolver = useCallback(
    (inst: ALPInstance, cfg: AGWOAConfig) => {
      const evaluator = new ALPEvaluator(inst, cfg.separationPenaltyFactor);
      const optimizer = new AGWOAOptimizer(evaluator, cfg);
      optimizer.initPopulation();

      const initialEval = optimizer.getBestEvaluation();
      optimizerRef.current = optimizer;

      setEvaluation(initialEval);
      setCurrentIter(0);
      setRuntimeSeconds(0);
    },
    []
  );

  // Load selected benchmark instance
  useEffect(() => {
    const inst = buildORLibInstance(selectedInstanceId);
    setCurrentInstance(inst);

    const targetSeed = 42 + selectedInstanceId;
    const newCfg = { ...config, seed: targetSeed };
    setConfig(newCfg);

    initializeSolver(inst, newCfg);
  }, [selectedInstanceId, initializeSolver]);

  // Run Optimization (Smooth live solve)
  const handleRunOptimization = () => {
    if (isOptimizing) return;

    initializeSolver(currentInstance, config);
    setIsOptimizing(true);
    startTimeRef.current = performance.now();

    const runStep = () => {
      if (!optimizerRef.current) return;

      let stepResult = { iteration: 0, bestCost: 0, a: 0, isFinished: false };
      // Advance by 6 generations per frame for brisk, responsive optimization
      for (let s = 0; s < 6; s++) {
        stepResult = optimizerRef.current.step();
        if (stepResult.isFinished) break;
      }

      setCurrentIter(stepResult.iteration);
      setEvaluation(optimizerRef.current.getBestEvaluation());
      setRuntimeSeconds((performance.now() - startTimeRef.current) / 1000);

      if (stepResult.isFinished) {
        setIsOptimizing(false);
        const finalEval = optimizerRef.current.getBestEvaluation();
        if (finalEval.feasible) {
          confetti({
            particleCount: 35,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#2563eb', '#10b981', '#f59e0b'],
          });
        }
      } else {
        animFrameIdRef.current = requestAnimationFrame(runStep);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(runStep);
  };

  // Reset solver
  const handleReset = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }
    setIsOptimizing(false);
    initializeSolver(currentInstance, config);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  const schedule: ScheduledAircraft[] = evaluation?.schedule || [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Simple Results Summary Banner */}
        <MetricCards
          evaluation={evaluation}
          aircraftCount={currentInstance.n}
          runtimeSeconds={runtimeSeconds}
        />

        {/* Simple Controls (Select Dataset + Optimize Button) */}
        <InteractiveSolver
          instance={currentInstance}
          onSelectInstanceId={setSelectedInstanceId}
          selectedInstanceId={selectedInstanceId}
          config={config}
          onUpdateConfig={(newCfg) => setConfig((prev) => ({ ...prev, ...newCfg }))}
          onRunOptimization={handleRunOptimization}
          onReset={handleReset}
          isOptimizing={isOptimizing}
          currentIter={currentIter}
        />

        {/* View 1: Schedule & Solver */}
        {activeTab === 'solver' && (
          <div>
            <RunwayTimeline schedule={schedule} />
            <ScheduleTable schedule={schedule} instanceName={currentInstance.name} />
          </div>
        )}

        {/* View 2: Radar & Approach View */}
        {activeTab === 'radar' && (
          <div>
            <RadarScope instance={currentInstance} schedule={schedule} />
            <ScheduleTable schedule={schedule} instanceName={currentInstance.name} />
          </div>
        )}

        {/* View 3: Airstrip Landing Simulation */}
        {activeTab === 'airstrip' && (
          <div>
            <AirstripLandingView schedule={schedule} instance={currentInstance} />
            <div className="mt-6">
              <ScheduleTable schedule={schedule} instanceName={currentInstance.name} />
            </div>
          </div>
        )}

        {/* View 4: Geographic Airspace Map View */}
        {activeTab === 'map' && (
          <div>
            <AirspaceMapView schedule={schedule} instance={currentInstance} />
            <div className="mt-6">
              <ScheduleTable schedule={schedule} instanceName={currentInstance.name} />
            </div>
          </div>
        )}

        {/* View 5: Evaluation & Correctness Metrics */}
        {activeTab === 'metrics' && (
          <div>
            <EvaluationMetricsView evaluation={evaluation} instance={currentInstance} />
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        <p>Airplane Landing Scheduler · Powered by AGWOA Algorithm</p>
      </footer>
    </div>
  );
}
