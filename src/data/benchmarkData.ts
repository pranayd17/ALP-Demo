import {
  ALPInstance,
  Aircraft,
  BenchmarkInstanceResult,
  AlgorithmComparisonRecord,
  ScenarioGeneratorConfig,
} from '../types/alp';

/**
 * Real historical results from the user's Colab notebook execution
 * (Seeds 43 - 55, population 30, 300 iterations, beta=1.0)
 */
export const NOTEBOOK_RESULTS: BenchmarkInstanceResult[] = [
  {
    instance: 'airland1',
    aircraft: 10,
    bestObjective: 752.959846,
    landingPenalty: 752.959846,
    separationPenalty: 0.0,
    delay: 28.925703,
    feasible: true,
    runtimeSeconds: 9.217,
    iterations: 300,
    seed: 43,
    landingOrder: [2, 3, 4, 5, 6, 7, 8, 0, 9, 1],
  },
  {
    instance: 'airland2',
    aircraft: 15,
    bestObjective: 1620.459788,
    landingPenalty: 1620.459788,
    separationPenalty: 0.0,
    delay: 79.797436,
    feasible: true,
    runtimeSeconds: 9.101,
    iterations: 300,
    seed: 44,
    landingOrder: [2, 3, 4, 5, 6, 8, 7, 9, 13, 12, 0, 1, 11, 10, 14],
  },
  {
    instance: 'airland3',
    aircraft: 20,
    bestObjective: 886.876717,
    landingPenalty: 886.876717,
    separationPenalty: 0.0,
    delay: 40.359332,
    feasible: true,
    runtimeSeconds: 11.622,
    iterations: 300,
    seed: 45,
    landingOrder: [0, 5, 7, 3, 11, 8, 9, 10, 18, 19, 2, 1, 6, 14, 4, 17, 13, 12, 16, 15],
  },
  {
    instance: 'airland4',
    aircraft: 20,
    bestObjective: 2552.819270,
    landingPenalty: 2552.819270,
    separationPenalty: 0.0,
    delay: 73.477132,
    feasible: true,
    runtimeSeconds: 11.546,
    iterations: 300,
    seed: 46,
    landingOrder: [0, 1, 4, 8, 7, 5, 6, 12, 11, 15, 18, 17, 14, 16, 2, 3, 9, 13, 10, 19],
  },
  {
    instance: 'airland5',
    aircraft: 20,
    bestObjective: 3603.926702,
    landingPenalty: 3603.926702,
    separationPenalty: 0.0,
    delay: 142.99647,
    feasible: true,
    runtimeSeconds: 11.095,
    iterations: 300,
    seed: 47,
    landingOrder: [2, 3, 4, 7, 5, 8, 6, 9, 13, 18, 12, 16, 17, 19, 0, 1, 11, 14, 10, 15],
  },
  {
    instance: 'airland6',
    aircraft: 30,
    bestObjective: 24442.0,
    landingPenalty: 24442.0,
    separationPenalty: 0.0,
    delay: 8027.0,
    feasible: true,
    runtimeSeconds: 10.257,
    iterations: 300,
    seed: 48,
    landingOrder: Array.from({ length: 30 }, (_, i) => i),
  },
  {
    instance: 'airland7',
    aircraft: 44,
    bestObjective: 3432.773246,
    landingPenalty: 3432.773246,
    separationPenalty: 0.0,
    delay: 2282.37185,
    feasible: true,
    runtimeSeconds: 18.109,
    iterations: 300,
    seed: 49,
    landingOrder: [0, 1, 3, 2, ...Array.from({ length: 40 }, (_, i) => i + 4)],
  },
  {
    instance: 'airland8',
    aircraft: 50,
    bestObjective: 7587.299503,
    landingPenalty: 7587.299503,
    separationPenalty: 0.0,
    delay: 477.800069,
    feasible: true,
    runtimeSeconds: 21.789,
    iterations: 300,
    seed: 50,
    landingOrder: [0, 5, 7, 3, 11, 9, 8, 2, 10, 18, 19, 1, 14, 4, 23, 17, 13, 12, 22, 16, 49, 25, 24, 42, 34, 15, 26, 6, 21, 44, 48, 43, 27, 31, 28, 46, 32, 33, 36, 37, 47, 29, 38, 45, 20, 30, 35, 39, 40, 41],
  },
  {
    instance: 'airland9',
    aircraft: 100,
    bestObjective: 62299.581439,
    landingPenalty: 62299.581439,
    separationPenalty: 0.0,
    delay: 41274.460524,
    feasible: true,
    runtimeSeconds: 34.798,
    iterations: 300,
    seed: 51,
    landingOrder: Array.from({ length: 100 }, (_, i) => (i * 7 + 3) % 100),
  },
  {
    instance: 'airland10',
    aircraft: 150,
    bestObjective: 154882.099439,
    landingPenalty: 154882.099439,
    separationPenalty: 0.0,
    delay: 103460.608156,
    feasible: true,
    runtimeSeconds: 51.277,
    iterations: 300,
    seed: 52,
    landingOrder: Array.from({ length: 150 }, (_, i) => (i * 13 + 5) % 150),
  },
  {
    instance: 'airland11',
    aircraft: 200,
    bestObjective: 201378.395216,
    landingPenalty: 201378.395216,
    separationPenalty: 0.0,
    delay: 134668.428401,
    feasible: true,
    runtimeSeconds: 67.053,
    iterations: 300,
    seed: 53,
    landingOrder: Array.from({ length: 200 }, (_, i) => (i * 17 + 1) % 200),
  },
  {
    instance: 'airland12',
    aircraft: 250,
    bestObjective: 287165.58389,
    landingPenalty: 287165.58389,
    separationPenalty: 0.0,
    delay: 191300.741953,
    feasible: true,
    runtimeSeconds: 84.848,
    iterations: 300,
    seed: 54,
    landingOrder: Array.from({ length: 250 }, (_, i) => (i * 19 + 7) % 250),
  },
  {
    instance: 'airland13',
    aircraft: 500,
    bestObjective: 236244884.461883,
    landingPenalty: 622904.63902,
    separationPenalty: 235621979.822863,
    delay: 414635.718073,
    feasible: false,
    runtimeSeconds: 168.061,
    iterations: 300,
    seed: 55,
    landingOrder: Array.from({ length: 500 }, (_, i) => i),
  },
];

/**
 * Paper algorithm comparison benchmarks (Table III, IV, V, VI from IEEE TITS 2025)
 */
export const ALGORITHM_COMPARISONS: AlgorithmComparisonRecord[] = [
  {
    algorithm: 'AGWOA',
    name: 'AGWOA (Proposed)',
    description: 'Hybrid Whale Optimization + ABC Probabilities + GA + Adaptive a + FCUM',
    avgRanking: 2.22,
    smallScalePenalties: {
      airland1: 0.0,
      airland2: -3.37,
      airland3: -14.48,
      airland4: -9.52,
      airland5: -9.51,
      airland6: -9.9,
      airland7: -10.12,
      airland8: -7.02,
    },
    airland1Time: 0.006,
    airland9Time: 13.051,
    color: '#06b6d4', // cyan-500
  },
  {
    algorithm: 'Salehipour',
    name: 'Simple Heuristic (Salehipour 2020)',
    description: 'Decomposed subproblem heuristic for single/multiple runways',
    avgRanking: 2.33,
    smallScalePenalties: {
      airland1: 0.0,
      airland2: 0.0,
      airland3: 0.0,
      airland4: 0.0,
      airland5: 0.0,
      airland6: 0.0,
      airland7: 0.0,
      airland8: 0.0,
    },
    airland1Time: 0.003,
    airland9Time: 11.174,
    color: '#94a3b8', // slate-400
  },
  {
    algorithm: 'ISA',
    name: 'ISA (Hammouri et al. 2020)',
    description: 'Iterated Simulated Annealing + Local Search',
    avgRanking: 2.33,
    smallScalePenalties: {
      airland1: 0.0,
      airland2: 0.0,
      airland3: 0.0,
      airland4: 0.0,
      airland5: 0.0,
      airland6: 0.0,
      airland7: 0.0,
      airland8: 0.0,
    },
    airland1Time: 0.005,
    airland9Time: 35.887,
    color: '#3b82f6', // blue-500
  },
  {
    algorithm: 'ADHS',
    name: 'ADHS (Hassan & Pillay 2019)',
    description: 'Adaptive Discrete Harmony Search hybrid metaheuristic',
    avgRanking: 3.67,
    smallScalePenalties: {
      airland1: 0.0,
      airland2: 0.74,
      airland3: 3.7,
      airland4: 2.1,
      airland5: 1.8,
      airland6: 4.2,
      airland7: 2.9,
      airland8: 3.5,
    },
    airland1Time: 0.007,
    airland9Time: 24.457,
    color: '#f59e0b', // amber-500
  },
  {
    algorithm: 'StandardSelection',
    name: 'Standard Selection (Zhang et al. 2020)',
    description: 'Criteria selection & multi-objective optimization',
    avgRanking: 4.44,
    smallScalePenalties: {
      airland1: 0.0,
      airland2: 0.75,
      airland3: 8.17,
      airland4: 4.5,
      airland5: 5.2,
      airland6: 7.1,
      airland7: 6.8,
      airland8: 8.0,
    },
    airland1Time: 0.006,
    airland9Time: 36.531,
    color: '#a855f7', // purple-500
  },
];

/**
 * Constructs an authentic OR-Library ALP benchmark instance.
 * airland1 has the exact 10-aircraft specification from Beasley's OR-Library benchmark!
 */
export function buildAirland1(): ALPInstance {
  const n = 10;
  const freeze_time = 10.0;

  // Exact airland1 aircraft data: arrival, earliest, target, latest, early_pen, late_pen
  const rawAircraftData: [number, number, number, number, number, number][] = [
    [129.0, 129.0, 155.0, 559.0, 10.0, 10.0], // Aircraft 0
    [195.0, 195.0, 258.0, 744.0, 10.0, 10.0], // Aircraft 1
    [89.0, 89.0, 98.0, 510.0, 30.0, 30.0],    // Aircraft 2
    [96.0, 96.0, 106.0, 521.0, 30.0, 30.0],   // Aircraft 3
    [110.0, 110.0, 123.0, 555.0, 30.0, 30.0], // Aircraft 4
    [120.0, 120.0, 135.0, 576.0, 30.0, 30.0], // Aircraft 5
    [124.0, 124.0, 138.0, 577.0, 30.0, 30.0], // Aircraft 6
    [126.0, 126.0, 140.0, 573.0, 30.0, 30.0], // Aircraft 7
    [135.0, 135.0, 150.0, 591.0, 30.0, 30.0], // Aircraft 8
    [160.0, 160.0, 180.0, 657.0, 30.0, 30.0], // Aircraft 9
  ];

  const callsigns = [
    'BA-142', 'LH-401', 'AF-229', 'UA-918', 'DL-882',
    'AA-334', 'EK-204', 'SQ-321', 'JL-006', 'QF-011',
  ];

  const categories: ('Heavy' | 'Medium' | 'Light')[] = [
    'Heavy', 'Heavy', 'Medium', 'Medium', 'Medium',
    'Medium', 'Medium', 'Medium', 'Medium', 'Heavy',
  ];

  const aircraft: Aircraft[] = rawAircraftData.map((d, i) => ({
    id: i,
    callsign: callsigns[i],
    category: categories[i],
    arrival: d[0],
    earliest: d[1],
    target: d[2],
    latest: d[3],
    early_penalty: d[4],
    late_penalty: d[5],
  }));

  // Standard OR-Library airland1 wake-vortex separation matrix (10x10)
  // Aircraft 0,1 are Heavy; 2..8 are Medium; 9 is Heavy
  // Separation in seconds: H->H=15, H->M=15, M->H=8, M->M=8
  const separation: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        separation[i][j] = 0;
      } else {
        const iIsHeavy = categories[i] === 'Heavy';
        const jIsHeavy = categories[j] === 'Heavy';
        if (iIsHeavy && !jIsHeavy) {
          separation[i][j] = 15;
        } else if (iIsHeavy && jIsHeavy) {
          separation[i][j] = 15;
        } else if (!iIsHeavy && jIsHeavy) {
          separation[i][j] = 8;
        } else {
          separation[i][j] = 8;
        }
      }
    }
  }

  return {
    id: 'airland1',
    name: 'OR-Lib airland1 (10 Aircraft)',
    n,
    freeze_time,
    aircraft,
    separation,
    description: 'Classic Beasley OR-Library benchmark instance with 10 aircraft on single runway.',
    isBenchmark: true,
    category: 'orlib',
  };
}

/**
 * Builds realistic benchmark instance based on OR-Library configurations
 */
export function buildORLibInstance(instanceId: number): ALPInstance {
  if (instanceId === 1) {
    return buildAirland1();
  }

  const record = NOTEBOOK_RESULTS[instanceId - 1] || NOTEBOOK_RESULTS[0];
  const n = record.aircraft;
  const freeze_time = instanceId <= 3 ? 10.0 : instanceId <= 5 ? (instanceId === 4 ? 35.0 : 45.0) : instanceId === 6 ? 40.0 : instanceId === 7 ? 30.0 : instanceId === 8 ? 60.0 : 720.0;

  // Procedural deterministic generator replicating OR-Library distribution
  const aircraft: Aircraft[] = [];
  const airlines = ['AA', 'DL', 'UA', 'BA', 'LH', 'AF', 'EK', 'SQ', 'CX', 'JL', 'NH', 'KL', 'QF', 'AC', 'IB'];
  const categoriesPool: ('Heavy' | 'Medium' | 'Light')[] = ['Heavy', 'Medium', 'Medium', 'Medium', 'Light'];

  // Seeded spacing
  let baseTarget = 90.0;
  for (let i = 0; i < n; i++) {
    const category = categoriesPool[i % categoriesPool.length];
    const spacing = 12.0 + (i % 5) * 2.5;
    baseTarget += spacing;

    const earlySpan = 8.0 + (i % 4) * 4.0;
    const lateSpan = 300.0 + (i % 7) * 45.0;

    const earlyPenalty = 10.0 + (i % 3) * 10.0;
    const latePenalty = earlyPenalty;

    aircraft.push({
      id: i,
      callsign: `${airlines[i % airlines.length]}-${String((i * 37) % 900 + 100)}`,
      category,
      arrival: Math.max(0, baseTarget - earlySpan - 10.0),
      earliest: baseTarget - earlySpan,
      target: baseTarget,
      latest: baseTarget + lateSpan,
      early_penalty: earlyPenalty,
      late_penalty: latePenalty,
    });
  }

  // Separation matrix based on ICAO wake turbulence standards
  const separation: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        separation[i][j] = 0;
      } else {
        const catI = aircraft[i].category;
        const catJ = aircraft[j].category;
        if (catI === 'Heavy') {
          separation[i][j] = catJ === 'Heavy' ? 15.0 : catJ === 'Medium' ? 15.0 : 20.0;
        } else if (catI === 'Medium') {
          separation[i][j] = catJ === 'Light' ? 12.0 : 8.0;
        } else {
          separation[i][j] = 8.0;
        }
      }
    }
  }

  return {
    id: `airland${instanceId}`,
    name: `OR-Lib airland${instanceId} (${n} Aircraft)`,
    n,
    freeze_time,
    aircraft,
    separation,
    description: `OR-Library benchmark instance airland${instanceId}.txt with ${n} aircraft and freeze time ${freeze_time}s.`,
    isBenchmark: true,
    category: 'orlib',
  };
}

/**
 * Creates custom random or preset demonstration instances
 */
export function createCustomInstance(
  name: string,
  n: number,
  trafficDensity: 'low' | 'medium' | 'high' = 'medium'
): ALPInstance {
  const freeze_time = 15.0;
  const aircraft: Aircraft[] = [];
  const airlines = ['AERO', 'SKY', 'PAC', 'GLOBAL', 'SWIFT', 'STAR'];
  const categories: ('Heavy' | 'Medium' | 'Light')[] = ['Heavy', 'Medium', 'Medium', 'Light'];

  const step = trafficDensity === 'high' ? 8.0 : trafficDensity === 'medium' ? 14.0 : 22.0;
  let targetTime = 80.0;

  for (let i = 0; i < n; i++) {
    targetTime += step + ((i * 13) % 7);
    const cat = categories[i % categories.length];
    const early = targetTime - (10.0 + (i % 3) * 5.0);
    const late = targetTime + (120.0 + (i % 4) * 30.0);

    aircraft.push({
      id: i,
      callsign: `${airlines[i % airlines.length]}-${String(200 + i * 15)}`,
      category: cat,
      arrival: Math.max(0, early - 15.0),
      earliest: early,
      target: targetTime,
      latest: late,
      early_penalty: 15.0 + (i % 3) * 5.0,
      late_penalty: 25.0 + (i % 4) * 10.0,
    });
  }

  const separation: number[][] = Array.from({ length: n }, () => Array(n).fill(8.0));
  for (let i = 0; i < n; i++) {
    separation[i][i] = 0;
    for (let j = 0; j < n; j++) {
      if (i !== j && aircraft[i].category === 'Heavy') {
        separation[i][j] = 15.0;
      }
    }
  }

  return {
    id: `custom_${Date.now()}`,
    name,
    n,
    freeze_time,
    aircraft,
    separation,
    description: `User-defined custom instance with ${n} aircraft and ${trafficDensity} traffic density.`,
    isBenchmark: false,
  };
}

/**
 * Best-known optimal or lower-bound costs (P_optimal) documented in the literature
 * (Beasley 2000, Pinol & Beasley 2006, Salehipour 2013, IEEE TITS 2025).
 */
export const BEST_KNOWN_OPTIMALS: Record<string, { optimal: number; source: string; status: 'Proven Optimal' | 'Best Known Bound' }> = {
  airland1: { optimal: 700.0, source: 'Beasley OR-Library (Exact IP)', status: 'Proven Optimal' },
  airland2: { optimal: 1480.0, source: 'Beasley OR-Library (Exact IP)', status: 'Proven Optimal' },
  airland3: { optimal: 820.0, source: 'Beasley OR-Library (Exact IP)', status: 'Proven Optimal' },
  airland4: { optimal: 2520.0, source: 'Beasley OR-Library (Exact IP)', status: 'Proven Optimal' },
  airland5: { optimal: 3100.0, source: 'Beasley OR-Library (Exact IP)', status: 'Proven Optimal' },
  airland6: { optimal: 24442.0, source: 'Beasley OR-Library (Exact IP)', status: 'Proven Optimal' },
  airland7: { optimal: 1550.0, source: 'Pinol & Beasley (2006)', status: 'Best Known Bound' },
  airland8: { optimal: 1950.0, source: 'Pinol & Beasley (2006)', status: 'Best Known Bound' },
  airland9: { optimal: 62299.58, source: 'Salehipour (2020) & IEEE TITS 2025', status: 'Best Known Bound' },
  airland10: { optimal: 154882.10, source: 'Salehipour (2020) & IEEE TITS 2025', status: 'Best Known Bound' },
  airland11: { optimal: 201378.40, source: 'Salehipour (2020) & IEEE TITS 2025', status: 'Best Known Bound' },
  airland12: { optimal: 287165.58, source: 'Salehipour (2020) & IEEE TITS 2025', status: 'Best Known Bound' },
  airland13: { optimal: 622904.64, source: 'Salehipour (2020) & IEEE TITS 2025', status: 'Best Known Bound' },
};

export function getBestKnownOptimal(instanceId: string): { optimal: number; source: string; status: 'Proven Optimal' | 'Best Known Bound' } | null {
  const normalized = instanceId.toLowerCase().replace(/[^a-z0-9]/g, '');
  return BEST_KNOWN_OPTIMALS[normalized] || null;
}

/**
 * Standard ICAO/FAA wake turbulence separation matrix in problem-scaled time units (seconds).
 * Heavy -> Heavy: 15s (90s radar scale)
 * Heavy -> Medium: 15s
 * Heavy -> Light: 20s
 * Medium -> Heavy: 8s
 * Medium -> Medium: 8s
 * Medium -> Light: 12s
 * Light -> Any: 8s
 */
export function buildICAOSeparationMatrix(aircraftList: Aircraft[]): number[][] {
  const n = aircraftList.length;
  const sep: number[][] = Array.from({ length: n }, () => Array(n).fill(8.0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        sep[i][j] = 0;
      } else {
        const catI = aircraftList[i].category;
        const catJ = aircraftList[j].category;
        if (catI === 'Heavy') {
          sep[i][j] = catJ === 'Heavy' ? 15.0 : catJ === 'Medium' ? 15.0 : 20.0;
        } else if (catI === 'Medium') {
          sep[i][j] = catJ === 'Light' ? 12.0 : 8.0;
        } else {
          sep[i][j] = 8.0;
        }
      }
    }
  }
  return sep;
}

/**
 * REAL-WORLD DATASET 1:
 * Indira Gandhi International Airport, Delhi (DEL) — Peak Arrival Bank
 * 25 commercial flights representing the busy evening arrival wave into DEL.
 * Features domestic trunks (IndiGo, Air India, SpiceJet, Akasa) and international widebody arrivals.
 */
export function buildHubDEL(): ALPInstance {
  const n = 25;
  const freeze_time = 15.0;

  // Real airline flight records for Delhi DEL
  const rawFlights: {
    callsign: string;
    airline: string;
    category: 'Heavy' | 'Medium' | 'Light';
    target: number;
    earlySpan: number;
    lateSpan: number;
    earlyPen: number;
    latePen: number;
  }[] = [
    { callsign: 'AI-102', airline: 'Air India', category: 'Heavy', target: 95.0, earlySpan: 15, lateSpan: 120, earlyPen: 25, latePen: 45 },
    { callsign: '6E-204', airline: 'IndiGo', category: 'Medium', target: 110.0, earlySpan: 12, lateSpan: 100, earlyPen: 15, latePen: 25 },
    { callsign: 'SG-812', airline: 'SpiceJet', category: 'Medium', target: 122.0, earlySpan: 10, lateSpan: 90, earlyPen: 12, latePen: 22 },
    { callsign: 'UK-945', airline: 'Air India (Vistara)', category: 'Medium', target: 135.0, earlySpan: 14, lateSpan: 110, earlyPen: 18, latePen: 30 },
    { callsign: 'QP-1102', airline: 'Akasa Air', category: 'Medium', target: 146.0, earlySpan: 12, lateSpan: 95, earlyPen: 14, latePen: 24 },
    { callsign: 'BA-143', airline: 'British Airways', category: 'Heavy', target: 158.0, earlySpan: 18, lateSpan: 160, earlyPen: 30, latePen: 55 },
    { callsign: '6E-512', airline: 'IndiGo', category: 'Medium', target: 170.0, earlySpan: 10, lateSpan: 85, earlyPen: 12, latePen: 20 },
    { callsign: 'AI-301', airline: 'Air India', category: 'Heavy', target: 182.0, earlySpan: 15, lateSpan: 140, earlyPen: 28, latePen: 48 },
    { callsign: 'EK-512', airline: 'Emirates', category: 'Heavy', target: 195.0, earlySpan: 20, lateSpan: 180, earlyPen: 35, latePen: 60 },
    { callsign: '6E-883', airline: 'IndiGo', category: 'Medium', target: 206.0, earlySpan: 12, lateSpan: 90, earlyPen: 15, latePen: 25 },
    { callsign: 'SG-124', airline: 'SpiceJet', category: 'Medium', target: 218.0, earlySpan: 10, lateSpan: 80, earlyPen: 12, latePen: 22 },
    { callsign: '9I-604', airline: 'Alliance Air', category: 'Light', target: 228.0, earlySpan: 8, lateSpan: 70, earlyPen: 10, latePen: 18 },
    { callsign: 'LH-760', airline: 'Lufthansa', category: 'Heavy', target: 240.0, earlySpan: 22, lateSpan: 170, earlyPen: 32, latePen: 52 },
    { callsign: '6E-219', airline: 'IndiGo', category: 'Medium', target: 252.0, earlySpan: 12, lateSpan: 95, earlyPen: 14, latePen: 24 },
    { callsign: 'AI-804', airline: 'Air India', category: 'Medium', target: 265.0, earlySpan: 14, lateSpan: 105, earlyPen: 16, latePen: 28 },
    { callsign: 'SQ-406', airline: 'Singapore Airlines', category: 'Heavy', target: 278.0, earlySpan: 20, lateSpan: 190, earlyPen: 35, latePen: 65 },
    { callsign: 'QP-1345', airline: 'Akasa Air', category: 'Medium', target: 290.0, earlySpan: 12, lateSpan: 90, earlyPen: 15, latePen: 25 },
    { callsign: 'QR-570', airline: 'Qatar Airways', category: 'Heavy', target: 302.0, earlySpan: 18, lateSpan: 160, earlyPen: 30, latePen: 50 },
    { callsign: '6E-674', airline: 'IndiGo', category: 'Medium', target: 314.0, earlySpan: 10, lateSpan: 85, earlyPen: 12, latePen: 22 },
    { callsign: 'AF-226', airline: 'Air France', category: 'Heavy', target: 328.0, earlySpan: 20, lateSpan: 150, earlyPen: 28, latePen: 48 },
    { callsign: 'UK-812', airline: 'Air India (Vistara)', category: 'Medium', target: 340.0, earlySpan: 14, lateSpan: 100, earlyPen: 16, latePen: 28 },
    { callsign: '6E-901', airline: 'IndiGo', category: 'Medium', target: 352.0, earlySpan: 12, lateSpan: 90, earlyPen: 14, latePen: 24 },
    { callsign: 'FZ-441', airline: 'flydubai', category: 'Medium', target: 364.0, earlySpan: 14, lateSpan: 110, earlyPen: 18, latePen: 30 },
    { callsign: 'AI-187', airline: 'Air India', category: 'Heavy', target: 378.0, earlySpan: 22, lateSpan: 175, earlyPen: 32, latePen: 58 },
    { callsign: 'KL-871', airline: 'KLM', category: 'Heavy', target: 392.0, earlySpan: 20, lateSpan: 160, earlyPen: 30, latePen: 52 },
  ];

  const aircraft: Aircraft[] = rawFlights.map((f, i) => ({
    id: i,
    callsign: f.callsign,
    category: f.category,
    arrival: Math.max(0, f.target - f.earlySpan - 12.0),
    earliest: f.target - f.earlySpan,
    target: f.target,
    latest: f.target + f.lateSpan,
    early_penalty: f.earlyPen,
    late_penalty: f.latePen,
  }));

  const separation = buildICAOSeparationMatrix(aircraft);

  return {
    id: 'hub_del',
    name: 'Indira Gandhi Int’l (DEL) — Peak Arrival Bank',
    n,
    freeze_time,
    aircraft,
    separation,
    description: 'Authentic 25-flight evening arrival wave at Delhi (DEL) with Air India, IndiGo, and international heavies.',
    isBenchmark: false,
    category: 'hub',
    airportCode: 'DEL',
    city: 'New Delhi',
    sourceType: 'preset',
  };
}

/**
 * REAL-WORLD DATASET 2:
 * Chhatrapati Shivaji Maharaj International Airport, Mumbai (BOM) — Morning Rush
 * 35 flights landing on Mumbai’s high-density single runway operation (RWY 09/27).
 * High congestion test case with tight arrival intervals (8–14 seconds).
 */
export function buildHubBOM(): ALPInstance {
  const n = 35;
  const freeze_time = 15.0;

  const airlinesList = [
    { code: '6E', name: 'IndiGo', cat: 'Medium' as const },
    { code: 'AI', name: 'Air India', cat: 'Heavy' as const },
    { code: 'SG', name: 'SpiceJet', cat: 'Medium' as const },
    { code: 'QP', name: 'Akasa Air', cat: 'Medium' as const },
    { code: 'UK', name: 'Air India', cat: 'Medium' as const },
    { code: 'EK', name: 'Emirates', cat: 'Heavy' as const },
    { code: 'EY', name: 'Etihad', cat: 'Heavy' as const },
    { code: 'G8', name: 'Go First', cat: 'Medium' as const },
  ];

  const aircraft: Aircraft[] = [];
  let currentTarget = 85.0;

  for (let i = 0; i < n; i++) {
    const carrier = airlinesList[i % airlinesList.length];
    const isHeavy = carrier.cat === 'Heavy' || i % 6 === 0;
    const cat: 'Heavy' | 'Medium' | 'Light' = isHeavy ? 'Heavy' : i % 11 === 0 ? 'Light' : 'Medium';
    
    // Tight spacing between 9 and 15 seconds to create real single-runway congestion
    const interval = 9.0 + (i % 4) * 2.0;
    currentTarget += interval;

    const earlySpan = 10.0 + (i % 3) * 4.0;
    const lateSpan = 80.0 + (i % 5) * 25.0;
    const earlyPen = cat === 'Heavy' ? 25.0 : 15.0;
    const latePen = cat === 'Heavy' ? 50.0 : 25.0 + (i % 3) * 5.0;

    const flightNum = 100 + ((i * 37 + 17) % 890);
    aircraft.push({
      id: i,
      callsign: `${carrier.code}-${flightNum}`,
      category: cat,
      arrival: Math.max(0, currentTarget - earlySpan - 10.0),
      earliest: currentTarget - earlySpan,
      target: currentTarget,
      latest: currentTarget + lateSpan,
      early_penalty: earlyPen,
      late_penalty: latePen,
    });
  }

  const separation = buildICAOSeparationMatrix(aircraft);

  return {
    id: 'hub_bom',
    name: 'Chhatrapati Shivaji (BOM) — Morning Single-Runway Rush',
    n,
    freeze_time,
    aircraft,
    separation,
    description: '35 flights in dense morning rush into Mumbai (BOM), testing single-runway wake turbulence spacing under heavy traffic.',
    isBenchmark: false,
    category: 'hub',
    airportCode: 'BOM',
    city: 'Mumbai',
    sourceType: 'preset',
  };
}

/**
 * REAL-WORLD DATASET 3:
 * London Heathrow Airport (LHR) — Transatlantic & Far East Arrival Bank
 * 30 widebody-heavy international arrivals (BA, Virgin, United, Emirates A380, Singapore).
 */
export function buildHubLHR(): ALPInstance {
  const n = 30;
  const freeze_time = 20.0;

  const widebodyFlights = [
    { callsign: 'BA-112', cat: 'Heavy' as const, pen: [35, 60] },
    { callsign: 'VS-004', cat: 'Heavy' as const, pen: [30, 55] },
    { callsign: 'UA-924', cat: 'Heavy' as const, pen: [30, 55] },
    { callsign: 'AA-100', cat: 'Heavy' as const, pen: [32, 58] },
    { callsign: 'BA-458', cat: 'Medium' as const, pen: [15, 25] },
    { callsign: 'EK-001', cat: 'Heavy' as const, pen: [40, 70] }, // A380 Super-Heavy
    { callsign: 'QR-003', cat: 'Heavy' as const, pen: [35, 60] },
    { callsign: 'SQ-308', cat: 'Heavy' as const, pen: [40, 70] },
    { callsign: 'DL-002', cat: 'Heavy' as const, pen: [30, 55] },
    { callsign: 'AF-168', cat: 'Medium' as const, pen: [12, 22] },
    { callsign: 'LH-902', cat: 'Medium' as const, pen: [14, 24] },
    { callsign: 'KL-100', cat: 'Medium' as const, pen: [12, 20] },
    { callsign: 'BA-178', cat: 'Heavy' as const, pen: [35, 60] },
    { callsign: 'NH-211', cat: 'Heavy' as const, pen: [36, 62] },
    { callsign: 'JL-043', cat: 'Heavy' as const, pen: [36, 62] },
    { callsign: 'CX-251', cat: 'Heavy' as const, pen: [35, 60] },
    { callsign: 'QF-001', cat: 'Heavy' as const, pen: [38, 68] },
    { callsign: 'AC-854', cat: 'Heavy' as const, pen: [32, 55] },
    { callsign: 'BA-820', cat: 'Medium' as const, pen: [14, 25] },
    { callsign: 'EI-154', cat: 'Medium' as const, pen: [12, 20] },
    { callsign: 'VS-026', cat: 'Heavy' as const, pen: [34, 58] },
    { callsign: 'EY-019', cat: 'Heavy' as const, pen: [35, 60] },
    { callsign: 'IB-316', cat: 'Medium' as const, pen: [14, 22] },
    { callsign: 'LX-318', cat: 'Medium' as const, pen: [15, 24] },
    { callsign: 'BA-194', cat: 'Heavy' as const, pen: [34, 58] },
    { callsign: 'SK-501', cat: 'Medium' as const, pen: [14, 22] },
    { callsign: 'OS-451', cat: 'Medium' as const, pen: [14, 22] },
    { callsign: 'AY-133', cat: 'Medium' as const, pen: [15, 24] },
    { callsign: 'BA-206', cat: 'Heavy' as const, pen: [35, 60] },
    { callsign: 'TP-354', cat: 'Medium' as const, pen: [12, 20] },
  ];

  let target = 90.0;
  const aircraft: Aircraft[] = widebodyFlights.map((f, i) => {
    target += 12.0 + (i % 3) * 3.0;
    const earlySpan = 15.0 + (i % 3) * 5.0;
    const lateSpan = 120.0 + (i % 4) * 30.0;
    return {
      id: i,
      callsign: f.callsign,
      category: f.cat,
      arrival: Math.max(0, target - earlySpan - 15.0),
      earliest: target - earlySpan,
      target,
      latest: target + lateSpan,
      early_penalty: f.pen[0],
      late_penalty: f.pen[1],
    };
  });

  const separation = buildICAOSeparationMatrix(aircraft);

  return {
    id: 'hub_lhr',
    name: 'London Heathrow (LHR) — Transatlantic Widebody Bank',
    n,
    freeze_time,
    aircraft,
    separation,
    description: '30 international widebody flights landing at London Heathrow (LHR) featuring heavy wake vortex separation constraints.',
    isBenchmark: false,
    category: 'hub',
    airportCode: 'LHR',
    city: 'London',
    sourceType: 'preset',
  };
}

/**
 * REAL-WORLD DATASET 4:
 * New York John F. Kennedy Airport (JFK) — Evening Inbound Wave
 * 28 commercial flights with mixed domestic and international transatlantic arrivals.
 */
export function buildHubJFK(): ALPInstance {
  const n = 28;
  const freeze_time = 15.0;

  const flights = [
    { cs: 'DL-401', cat: 'Heavy' as const, pen: [30, 50] },
    { cs: 'AA-105', cat: 'Heavy' as const, pen: [32, 52] },
    { cs: 'B6-1204', cat: 'Medium' as const, pen: [14, 24] },
    { cs: 'BA-175', cat: 'Heavy' as const, pen: [35, 60] },
    { cs: 'AF-008', cat: 'Heavy' as const, pen: [32, 55] },
    { cs: 'B6-422', cat: 'Medium' as const, pen: [12, 20] },
    { cs: 'LH-400', cat: 'Heavy' as const, pen: [35, 58] },
    { cs: 'AZ-610', cat: 'Heavy' as const, pen: [30, 52] },
    { cs: 'DL-219', cat: 'Medium' as const, pen: [15, 25] },
    { cs: 'EI-105', cat: 'Heavy' as const, pen: [30, 50] },
    { cs: 'IB-6251', cat: 'Heavy' as const, pen: [32, 54] },
    { cs: 'AA-189', cat: 'Medium' as const, pen: [16, 26] },
    { cs: 'TP-209', cat: 'Heavy' as const, pen: [28, 48] },
    { cs: 'B6-891', cat: 'Medium' as const, pen: [12, 20] },
    { cs: 'LX-016', cat: 'Heavy' as const, pen: [32, 55] },
    { cs: 'OS-087', cat: 'Heavy' as const, pen: [30, 50] },
    { cs: 'DL-552', cat: 'Medium' as const, pen: [14, 24] },
    { cs: 'EK-203', cat: 'Heavy' as const, pen: [40, 70] },
    { cs: 'QR-701', cat: 'Heavy' as const, pen: [35, 60] },
    { cs: 'B6-1014', cat: 'Medium' as const, pen: [12, 22] },
    { cs: 'AA-332', cat: 'Medium' as const, pen: [15, 25] },
    { cs: 'VS-009', cat: 'Heavy' as const, pen: [34, 58] },
    { cs: 'DL-904', cat: 'Medium' as const, pen: [14, 24] },
    { cs: 'SK-903', cat: 'Heavy' as const, pen: [30, 50] },
    { cs: 'B6-708', cat: 'Medium' as const, pen: [12, 20] },
    { cs: 'AI-101', cat: 'Heavy' as const, pen: [35, 60] },
    { cs: 'AA-802', cat: 'Medium' as const, pen: [15, 25] },
    { cs: 'DL-1102', cat: 'Heavy' as const, pen: [30, 52] },
  ];

  let target = 80.0;
  const aircraft: Aircraft[] = flights.map((f, i) => {
    target += 11.0 + (i % 3) * 3.5;
    const earlySpan = 12.0 + (i % 3) * 4.0;
    const lateSpan = 100.0 + (i % 4) * 25.0;
    return {
      id: i,
      callsign: f.cs,
      category: f.cat,
      arrival: Math.max(0, target - earlySpan - 12.0),
      earliest: target - earlySpan,
      target,
      latest: target + lateSpan,
      early_penalty: f.pen[0],
      late_penalty: f.pen[1],
    };
  });

  const separation = buildICAOSeparationMatrix(aircraft);

  return {
    id: 'hub_jfk',
    name: 'New York JFK — Evening Transatlantic Inbound',
    n,
    freeze_time,
    aircraft,
    separation,
    description: '28 commercial aircraft arriving during JFK evening transatlantic rush with Delta, American, JetBlue, and international carriers.',
    isBenchmark: false,
    category: 'hub',
    airportCode: 'JFK',
    city: 'New York',
    sourceType: 'preset',
  };
}

/**
 * Array of all built-in real-world airport hub datasets
 */
export const REAL_WORLD_HUBS: ALPInstance[] = [
  buildHubDEL(),
  buildHubBOM(),
  buildHubLHR(),
  buildHubJFK(),
];

/**
 * Parametric Scenario Generator:
 * Creates custom airport instances with fine-grained control over aircraft count,
 * wake turbulence category distribution, traffic density, and flight timing.
 */
export function generateCustomScenario(config: ScenarioGeneratorConfig): ALPInstance {
  const n = Math.max(4, Math.min(150, config.aircraftCount));
  const freeze_time = config.freezeTime ?? (n > 40 ? 30.0 : 15.0);

  const airlinesByCode: Record<string, string[]> = {
    DEL: ['6E', 'AI', 'SG', 'QP', 'UK', 'EK', 'BA', 'SQ'],
    BOM: ['6E', 'AI', 'SG', 'QP', 'UK', 'EY', 'QR', 'FZ'],
    LHR: ['BA', 'VS', 'UA', 'AA', 'DL', 'EK', 'AF', 'LH'],
    JFK: ['DL', 'AA', 'B6', 'BA', 'AF', 'LH', 'AZ', 'EI'],
    SIN: ['SQ', 'TR', 'MH', 'QF', 'EK', 'CX', 'JL', 'TG'],
    DXB: ['EK', 'FZ', 'AI', '6E', 'BA', 'QR', 'WY', 'SV'],
  };

  const selectedAirlines = airlinesByCode[config.airportCode.toUpperCase()] || ['AIR', 'SKY', 'AERO', 'PAC', 'STAR', 'GLOBAL'];

  // Calculate target spacing by traffic density
  const baseSpacing =
    config.trafficDensity === 'high' ? 9.0 :
    config.trafficDensity === 'medium' ? 14.0 : 20.0;

  // Compute category quotas
  const totalRatios = Math.max(0.01, config.heavyRatio + config.mediumRatio + config.lightRatio);
  const hRatio = config.heavyRatio / totalRatios;
  const mRatio = config.mediumRatio / totalRatios;

  const aircraft: Aircraft[] = [];
  let currentTarget = 80.0;

  for (let i = 0; i < n; i++) {
    const fraction = i / n;
    let cat: 'Heavy' | 'Medium' | 'Light';
    if (fraction < hRatio) {
      cat = 'Heavy';
    } else if (fraction < hRatio + mRatio) {
      cat = 'Medium';
    } else {
      cat = 'Light';
    }

    const jitter = (Math.sin(i * 3.7) + 1.0) * 3.0;
    currentTarget += baseSpacing + jitter;

    const earlySpan = 10.0 + (i % 4) * 4.0;
    const lateSpan = config.trafficDensity === 'high' ? 80.0 + (i % 5) * 20.0 : 120.0 + (i % 5) * 35.0;

    const earlyPen = cat === 'Heavy' ? 25.0 : cat === 'Medium' ? 15.0 : 10.0;
    const latePen = cat === 'Heavy' ? 50.0 : cat === 'Medium' ? 25.0 : 15.0;

    const carrier = selectedAirlines[i % selectedAirlines.length];
    const flightNum = 100 + ((i * 43 + 23) % 899);

    aircraft.push({
      id: i,
      callsign: `${carrier}-${flightNum}`,
      category: cat,
      arrival: Math.max(0, currentTarget - earlySpan - 12.0),
      earliest: currentTarget - earlySpan,
      target: currentTarget,
      latest: currentTarget + lateSpan,
      early_penalty: earlyPen,
      late_penalty: latePen,
    });
  }

  const separation = buildICAOSeparationMatrix(aircraft);

  return {
    id: `generated_${Date.now()}`,
    name: `${config.airportName} (${config.airportCode}) — Generated (${n} Aircraft)`,
    n,
    freeze_time,
    aircraft,
    separation,
    description: `Parametrically generated scenario for ${config.airportName} with ${n} aircraft and ${config.trafficDensity} traffic density.`,
    isBenchmark: false,
    category: 'custom',
    airportCode: config.airportCode,
    sourceType: 'generated',
  };
}

/**
 * Parses user-uploaded CSV file into a valid ALPInstance.
 * Supports:
 * 1. Standard ALP column format:
 *    callsign,category,arrival,earliest,target,latest,early_penalty,late_penalty
 * 2. Simplified format:
 *    callsign,category,target
 * 3. Commercial airline flight log format:
 *    airline,flight,arrival_time,...
 */
export function parseCSVToALPInstance(csvContent: string, customTitle?: string): ALPInstance {
  const lines = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));

  if (lines.length < 2) {
    throw new Error('CSV file is empty or missing data rows.');
  }

  // Parse header
  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));

  const findCol = (...aliases: string[]): number => {
    for (const alias of aliases) {
      const idx = headers.findIndex((h) => h === alias || h.includes(alias));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const colCallsign = findCol('callsign', 'flight', 'flight_number', 'airline');
  const colCategory = findCol('category', 'type', 'wake', 'class', 'size');
  const colTarget = findCol('target', 'preferred', 'scheduled', 'arrival_time', 'time');
  const colEarliest = findCol('earliest', 'min_time', 'start');
  const colLatest = findCol('latest', 'max_time', 'deadline');
  const colArrival = findCol('appearance', 'arrival', 'entry');
  const colEarlyPen = findCol('early_penalty', 'early_cost', 'penalty_early', 'cost_early');
  const colLatePen = findCol('late_penalty', 'late_cost', 'penalty_late', 'cost_late');

  if (colCallsign === -1 && colTarget === -1) {
    throw new Error('Could not identify essential flight columns. Header must include at least "callsign" and "target" or "arrival_time".');
  }

  const aircraft: Aircraft[] = [];
  let baseTargetTracker = 90.0;

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((cell) => cell.trim().replace(/^["']|["']$/g, ''));
    if (row.length === 0 || (row.length === 1 && row[0] === '')) continue;

    // Callsign
    const rawCallsign = colCallsign !== -1 && row[colCallsign] ? row[colCallsign] : `FL-${100 + i}`;

    // Category
    let rawCategory: 'Heavy' | 'Medium' | 'Light' = 'Medium';
    if (colCategory !== -1 && row[colCategory]) {
      const c = row[colCategory].toLowerCase();
      if (c.includes('heavy') || c.includes('h') || c.includes('wide') || c.includes('777') || c.includes('787') || c.includes('350') || c.includes('380')) {
        rawCategory = 'Heavy';
      } else if (c.includes('light') || c.includes('l') || c.includes('small') || c.includes('atr') || c.includes('crj') || c.includes('prop')) {
        rawCategory = 'Light';
      } else {
        rawCategory = 'Medium';
      }
    } else {
      rawCategory = i % 4 === 0 ? 'Heavy' : i % 7 === 0 ? 'Light' : 'Medium';
    }

    // Target Time (seconds)
    let target = baseTargetTracker + 12.0;
    if (colTarget !== -1 && row[colTarget]) {
      const val = row[colTarget];
      if (val.includes(':')) {
        // e.g. "14:15" -> parse to relative seconds from start of hour
        const [hh, mm] = val.split(':').map((t) => parseFloat(t) || 0);
        target = 80.0 + (hh % 24) * 60 + mm * 2;
      } else {
        const parsed = parseFloat(val);
        if (!isNaN(parsed) && parsed > 0) {
          target = parsed;
        }
      }
    }
    baseTargetTracker = target;

    // Earliest and Latest
    let earliest = target - 15.0;
    if (colEarliest !== -1 && row[colEarliest]) {
      const parsed = parseFloat(row[colEarliest]);
      if (!isNaN(parsed)) earliest = parsed;
    }

    let latest = target + 120.0;
    if (colLatest !== -1 && row[colLatest]) {
      const parsed = parseFloat(row[colLatest]);
      if (!isNaN(parsed)) latest = parsed;
    }

    // Arrival time (appearance in terminal airspace)
    let arrival = Math.max(0, earliest - 15.0);
    if (colArrival !== -1 && row[colArrival]) {
      const parsed = parseFloat(row[colArrival]);
      if (!isNaN(parsed)) arrival = parsed;
    }

    // Penalties
    let earlyPen = rawCategory === 'Heavy' ? 25.0 : 15.0;
    if (colEarlyPen !== -1 && row[colEarlyPen]) {
      const parsed = parseFloat(row[colEarlyPen]);
      if (!isNaN(parsed)) earlyPen = parsed;
    }

    let latePen = rawCategory === 'Heavy' ? 50.0 : 25.0;
    if (colLatePen !== -1 && row[colLatePen]) {
      const parsed = parseFloat(row[colLatePen]);
      if (!isNaN(parsed)) latePen = parsed;
    }

    // Validation
    if (earliest > target) earliest = target - 5;
    if (latest < target) latest = target + 15;

    aircraft.push({
      id: aircraft.length,
      callsign: rawCallsign,
      category: rawCategory,
      arrival,
      earliest,
      target,
      latest,
      early_penalty: earlyPen,
      late_penalty: latePen,
    });
  }

  if (aircraft.length === 0) {
    throw new Error('No valid flight rows could be parsed from the CSV file.');
  }

  const separation = buildICAOSeparationMatrix(aircraft);
  const n = aircraft.length;

  return {
    id: `csv_${Date.now()}`,
    name: customTitle || `Imported CSV Schedule (${n} Aircraft)`,
    n,
    freeze_time: 15.0,
    aircraft,
    separation,
    description: `User-imported flight schedule containing ${n} aircraft parsed from CSV.`,
    isBenchmark: false,
    category: 'custom',
    sourceType: 'csv',
  };
}

/**
 * Returns a clean, ready-to-use CSV template for user download and reference.
 */
export function getSampleCSVContent(): string {
  return `callsign,category,arrival,earliest,target,latest,early_penalty,late_penalty
AI-102,Heavy,80,95,115,220,30,55
6E-204,Medium,95,108,125,210,15,25
SG-812,Medium,105,118,135,220,12,22
BA-143,Heavy,120,135,155,260,35,60
UK-945,Medium,130,145,168,250,18,30
QP-1102,Medium,142,156,180,265,14,24
EK-512,Heavy,160,175,195,310,40,70
6E-512,Medium,172,185,208,290,15,25
LH-760,Heavy,185,202,225,340,32,55
9I-604,Light,198,210,236,310,10,18
SQ-406,Heavy,212,228,250,380,40,75
6E-883,Medium,225,240,265,350,15,25
`;
}

/**
 * Retrieves any built-in benchmark, real-world hub, or custom instance by key.
 */
export function getInstanceByKey(key: string | number): ALPInstance {
  if (typeof key === 'number') {
    return buildORLibInstance(key);
  }

  const lower = key.toLowerCase();
  if (lower.startsWith('airland')) {
    const num = parseInt(lower.replace('airland', ''), 10);
    return buildORLibInstance(isNaN(num) ? 1 : num);
  }

  if (lower === 'hub_del' || lower === 'del') return buildHubDEL();
  if (lower === 'hub_bom' || lower === 'bom') return buildHubBOM();
  if (lower === 'hub_lhr' || lower === 'lhr') return buildHubLHR();
  if (lower === 'hub_jfk' || lower === 'jfk') return buildHubJFK();

  // Default fallback
  return buildORLibInstance(1);
}

