/**
 * Types and interfaces for the Aircraft Landing Problem (ALP)
 * and the AGWOA optimization algorithm.
 */

export interface Aircraft {
  id: number;
  callsign: string;
  category: 'Heavy' | 'Medium' | 'Light';
  arrival: number;         // Appearance time A_i
  earliest: number;        // Earliest landing time E_i
  target: number;          // Preferred / target landing time T_i
  latest: number;          // Latest landing time L_i
  early_penalty: number;   // Unit cost for landing earlier than target (P_bi / g_i)
  late_penalty: number;    // Unit cost for landing later than target (P_Ai / h_i)
}

export interface ALPInstance {
  id: string;
  name: string;
  n: number;
  freeze_time: number;
  aircraft: Aircraft[];
  separation: number[][]; // [i][j] = min separation required if i lands before j
  description?: string;
  isBenchmark?: boolean;
}

export interface ScheduledAircraft {
  position: number;       // Landing sequence position (1-indexed)
  aircraftId: number;
  callsign: string;
  category: 'Heavy' | 'Medium' | 'Light';
  landingTime: number;
  earliest: number;
  target: number;
  latest: number;
  deviationType: 'Early' | 'On-Time' | 'Late';
  deviation: number;
  penalty: number;
  separationFromPrev?: number;
  requiredSepFromPrev?: number;
  separationOk?: boolean;
}

export interface Evaluation {
  total_cost: number;
  landing_penalty: number;
  separation_penalty: number;
  delay: number;
  feasible: boolean;
  timeWindowViolation: number;
  separationViolation: number;
  landingOrder: number[];
  schedule: ScheduledAircraft[];
}

export interface AGWOAConfig {
  populationSize: number;
  maxIter: number;
  beta: number;
  bubbleWeight: number;
  crossoverRate: number;
  mutationRate: number;
  mutationScale: number;
  scoutFraction: number;
  fcumRate: number;
  seed: number;
  usePaperAdaptiveA: boolean;
  separationPenaltyFactor: number;
}

export interface AGWOAResult {
  bestPosition: number[];
  bestCost: number;
  bestEvaluation: Evaluation;
  convergence: number[];
  runtimeSeconds: number;
  iterations: number;
  seed: number;
  config: AGWOAConfig;
}

export interface BenchmarkInstanceResult {
  instance: string;
  aircraft: number;
  bestObjective: number;
  landingPenalty: number;
  separationPenalty: number;
  delay: number;
  feasible: boolean;
  runtimeSeconds: number;
  iterations: number;
  seed: number;
  landingOrder: number[];
}

export interface AlgorithmComparisonRecord {
  algorithm: string;
  name: string;
  description: string;
  avgRanking: number; // Friedman test ranking
  smallScalePenalties: { [instance: string]: number }; // relative delta %
  airland1Time: number;
  airland9Time: number;
  color: string;
}
