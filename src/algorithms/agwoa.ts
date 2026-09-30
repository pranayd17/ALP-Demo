import { AGWOAConfig, AGWOAResult, ALPInstance, Evaluation } from '../types/alp';
import { ALPEvaluator } from './alpEvaluator';

/**
 * Seedable Linear Congruential / Xoshiro PRNG for deterministic reproducibility
 */
class SeededRNG {
  private seed: number;

  constructor(seed = 42) {
    this.seed = (seed ^ 0x6d2b79f5) >>> 0;
  }

  public random(): number {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  public uniform(min: number, max: number): number {
    return min + this.random() * (max - min);
  }

  public normal(mean = 0, std = 1): number {
    // Box-Muller transform
    let u1 = this.random();
    let u2 = this.random();
    while (u1 <= 1e-15) u1 = this.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * std + mean;
  }

  public choice(probabilities: number[]): number {
    const r = this.random();
    let accum = 0;
    for (let i = 0; i < probabilities.length; i++) {
      accum += probabilities[i];
      if (r <= accum) {
        return i;
      }
    }
    return probabilities.length - 1;
  }
}

export const DEFAULT_AGWOA_CONFIG: AGWOAConfig = {
  populationSize: 30,
  maxIter: 300,
  beta: 1.0,
  bubbleWeight: 0.5,
  crossoverRate: 0.8,
  mutationRate: 0.1,
  mutationScale: 0.05,
  scoutFraction: 0.1,
  fcumRate: 0.5,
  seed: 42,
  usePaperAdaptiveA: true,
  separationPenaltyFactor: 1_000_000.0,
};

export class AGWOAOptimizer {
  private ev: ALPEvaluator;
  private inst: ALPInstance;
  private config: AGWOAConfig;
  private rng: SeededRNG;

  private population: number[][] = [];
  private bestPosition: number[] = [];
  private bestCost = Infinity;
  private history: number[] = [];
  private currentIter = 0;

  constructor(evaluator: ALPEvaluator, config: Partial<AGWOAConfig> = {}) {
    this.ev = evaluator;
    this.inst = evaluator.getInstance();
    this.config = { ...DEFAULT_AGWOA_CONFIG, ...config };
    this.rng = new SeededRNG(this.config.seed);
  }

  public initPopulation(): void {
    const { populationSize } = this.config;
    const { aircraft, n } = this.inst;

    this.population = [];
    const costs: number[] = [];

    for (let p = 0; p < populationSize; p++) {
      const individual: number[] = new Array(n);
      for (let i = 0; i < n; i++) {
        individual[i] = this.rng.uniform(aircraft[i].earliest, aircraft[i].latest);
      }
      const repaired = this.ev.repair(individual);
      this.population.push(repaired);
      costs.push(this.ev.evaluate(repaired).total_cost);
    }

    let minIdx = 0;
    let minCost = costs[0];
    for (let i = 1; i < costs.length; i++) {
      if (costs[i] < minCost) {
        minCost = costs[i];
        minIdx = i;
      }
    }

    this.bestPosition = [...this.population[minIdx]];
    this.bestCost = minCost;
    this.history = [this.bestCost];
    this.currentIter = 0;
  }

  private adaptiveA(iteration: number): number {
    const t = iteration + 1;
    const T = Math.max(1, this.config.maxIter);
    if (this.config.usePaperAdaptiveA) {
      // Eq. (14) in the IEEE TITS paper: a = (t / Tmax)^beta
      return Math.pow(t / T, this.config.beta);
    }
    // Conventional WOA descending factor: 2(1 - t / T)
    return 2.0 * (1.0 - t / T);
  }

  private abcProbabilities(): number[] {
    const { populationSize } = this.config;
    const f: number[] = this.population.map((x) => this.ev.fitness(x));
    const sumF = f.reduce((acc, val) => acc + val, 0);

    if (sumF <= 0 || !Number.isFinite(sumF)) {
      return new Array(populationSize).fill(1.0 / populationSize);
    }

    const maxF = Math.max(...f, 1e-15);
    const pTotal: number[] = new Array(populationSize);
    let sumPTotal = 0;

    for (let i = 0; i < populationSize; i++) {
      const pFollow = f[i] / sumF;
      const pChoose = f[i] / maxF;
      const pt = pFollow * pChoose; // Eq. (22) in paper
      pTotal[i] = pt;
      sumPTotal += pt;
    }

    if (sumPTotal <= 0 || !Number.isFinite(sumPTotal)) {
      return new Array(populationSize).fill(1.0 / populationSize);
    }

    return pTotal.map((pt) => pt / sumPTotal);
  }

  private encirclingUpdate(x: number[], targetWhale: number[], a: number): number[] {
    const n = this.inst.n;
    const res: number[] = new Array(n);
    const { bubbleWeight } = this.config;

    for (let j = 0; j < n; j++) {
      const r1 = this.rng.random();
      const r2 = this.rng.random();
      const A = 2.0 * a * r1 - a;
      const C = 2.0 * r2;
      const D = Math.abs(C * targetWhale[j] - x[j]);
      const B = bubbleWeight * this.rng.uniform(-1.0, 1.0);
      res[j] = targetWhale[j] - (A + B) * D;
    }
    return res;
  }

  private globalSearchUpdate(x: number[], a: number): number[] {
    const n = this.inst.n;
    const randomWhaleIdx = Math.floor(this.rng.uniform(0, this.config.populationSize));
    const reference = this.population[randomWhaleIdx];
    const res: number[] = new Array(n);

    for (let j = 0; j < n; j++) {
      const r1 = this.rng.random();
      const r2 = this.rng.random();
      const A = 2.0 * a * r1 - a;
      const C = 2.0 * r2;
      const D = Math.abs(C * reference[j] - x[j]);
      res[j] = reference[j] - A * D;
    }
    return res;
  }

  private spiralUpdate(x: number[], best: number[]): number[] {
    const n = this.inst.n;
    const res: number[] = new Array(n);
    const b = 1.0;

    for (let j = 0; j < n; j++) {
      const l = this.rng.uniform(-1.0, 1.0);
      const Dprime = Math.abs(best[j] - x[j]);
      res[j] = Dprime * Math.exp(b * l) * Math.cos(2.0 * Math.PI * l) + best[j];
    }
    return res;
  }

  private crossover(p1: number[], p2: number[]): number[] {
    const n = this.inst.n;
    const child = [...p1];

    if (this.rng.random() < this.config.crossoverRate) {
      for (let j = 0; j < n; j++) {
        if (this.rng.random() < 0.5) {
          child[j] = p2[j];
        }
        // Arithmetic blend crossover for continuous landing window
        if (this.rng.random() < 0.25) {
          const alpha = this.rng.random();
          child[j] = alpha * p1[j] + (1.0 - alpha) * p2[j];
        }
      }
    }
    return child;
  }

  private mutation(x: number[]): number[] {
    const n = this.inst.n;
    const { aircraft } = this.inst;
    const child = [...x];

    for (let j = 0; j < n; j++) {
      if (this.rng.random() < this.config.mutationRate) {
        const span = Math.max(aircraft[j].latest - aircraft[j].earliest, 1e-9);
        const sigma = this.config.mutationScale * span;
        child[j] += this.rng.normal(0.0, sigma);
      }
    }
    return this.ev.repair(child);
  }

  private fcum(parent: number[], offspring: number[]): number[] {
    if (this.rng.random() > this.config.fcumRate) {
      return offspring;
    }

    const current = [...offspring];
    const best = this.bestPosition;
    const baseCost = this.ev.evaluate(current).total_cost;
    const n = this.inst.n;

    let allZero = true;
    for (let j = 0; j < n; j++) {
      if (Math.abs(best[j] - current[j]) > 1e-9) {
        allZero = false;
        break;
      }
    }
    if (allZero) return current;

    let eta = 1.0;
    let bestCandidate = current;
    let bestCandidateCost = baseCost;

    for (let step = 0; step < 8; step++) {
      const candidate: number[] = new Array(n);
      for (let j = 0; j < n; j++) {
        candidate[j] = current[j] + eta * (best[j] - current[j]);
      }
      const repaired = this.ev.repair(candidate);
      const c = this.ev.evaluate(repaired).total_cost;

      if (c < bestCandidateCost) {
        bestCandidate = repaired;
        bestCandidateCost = c;
      }
      eta *= 0.5;
    }

    return bestCandidate;
  }

  /**
   * Executes a single optimization iteration step.
   * Useful for progressive live animation and UI updates.
   */
  public step(): {
    iteration: number;
    bestCost: number;
    a: number;
    isFinished: boolean;
  } {
    const { populationSize, maxIter, scoutFraction } = this.config;
    const n = this.inst.n;

    if (this.population.length === 0) {
      this.initPopulation();
    }

    const a = this.adaptiveA(this.currentIter);
    const probabilities = this.abcProbabilities();

    const newPopulation: number[][] = new Array(populationSize);

    // 1. WOA + ABC position update
    for (let i = 0; i < populationSize; i++) {
      const x = this.population[i];
      const refIdx = this.rng.choice(probabilities);
      const reference = this.population[refIdx];

      let candidate: number[];

      if (this.rng.random() < 0.5) {
        // Exploitation branch
        const r1Arr = new Array(n).fill(0).map(() => this.rng.random());
        const meanAbsA =
          r1Arr.reduce((acc, r1) => acc + Math.abs(2.0 * a * r1 - a), 0) / n;

        if (meanAbsA < 1.0) {
          candidate = this.encirclingUpdate(x, this.bestPosition, a);
        } else {
          candidate = this.globalSearchUpdate(x, a);
        }
      } else {
        // Global / spiral branch
        if (this.rng.random() < 0.5) {
          candidate = this.encirclingUpdate(x, reference, a);
        } else {
          candidate = this.spiralUpdate(x, this.bestPosition);
        }
      }

      candidate = this.ev.repair(candidate);

      const oldCost = this.ev.evaluate(x).total_cost;
      const newCost = this.ev.evaluate(candidate).total_cost;

      newPopulation[i] = newCost <= oldCost ? candidate : x;
    }

    this.population = newPopulation;

    // 2. GA phase: crossover, mutation & FCUM
    const popCosts = this.population.map((x) => this.ev.evaluate(x).total_cost);
    const ranked = popCosts
      .map((cost, idx) => ({ cost, idx }))
      .sort((a, b) => a.cost - b.cost)
      .map((item) => item.idx);

    const eliteCount = Math.max(2, Math.floor(populationSize / 5));
    const offspring = [...this.population];

    for (let k = eliteCount; k < populationSize; k++) {
      const p1Idx = ranked[Math.floor(this.rng.uniform(0, eliteCount))];
      const p2Idx = ranked[Math.floor(this.rng.uniform(0, eliteCount))];

      let child = this.crossover(this.population[p1Idx], this.population[p2Idx]);
      child = this.mutation(child);
      child = this.fcum(this.population[k], child);
      child = this.ev.repair(child);

      const childCost = this.ev.evaluate(child).total_cost;
      const parentCost = this.ev.evaluate(this.population[k]).total_cost;

      if (childCost <= parentCost) {
        offspring[k] = child;
      }
    }

    this.population = offspring;

    // 3. Scout-bee phase: replace worst individuals
    const scoutCount = Math.max(1, Math.floor(populationSize * scoutFraction));
    const afterCosts = this.population.map((x) => this.ev.evaluate(x).total_cost);
    const worstRanked = afterCosts
      .map((cost, idx) => ({ cost, idx }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, scoutCount)
      .map((item) => item.idx);

    for (const idx of worstRanked) {
      const scout: number[] = new Array(n);
      for (let j = 0; j < n; j++) {
        scout[j] = this.rng.uniform(
          this.inst.aircraft[j].earliest,
          this.inst.aircraft[j].latest
        );
      }
      const repaired = this.ev.repair(scout);
      const scoutCost = this.ev.evaluate(repaired).total_cost;
      if (scoutCost < afterCosts[idx]) {
        this.population[idx] = repaired;
      }
    }

    // 4. Update global best
    const finalCosts = this.population.map((x) => this.ev.evaluate(x).total_cost);
    for (let i = 0; i < populationSize; i++) {
      if (finalCosts[i] < this.bestCost) {
        this.bestCost = finalCosts[i];
        this.bestPosition = [...this.population[i]];
      }
    }

    this.history.push(this.bestCost);
    this.currentIter++;

    const isFinished = this.currentIter >= maxIter;

    return {
      iteration: this.currentIter,
      bestCost: this.bestCost,
      a,
      isFinished,
    };
  }

  /**
   * Runs the full optimization to completion.
   */
  public solve(onProgress?: (progress: number, cost: number) => void): AGWOAResult {
    const startTime = performance.now();
    this.initPopulation();

    for (let iter = 0; iter < this.config.maxIter; iter++) {
      this.step();
      if (onProgress && iter % 10 === 0) {
        onProgress((iter + 1) / this.config.maxIter, this.bestCost);
      }
    }

    const elapsedSeconds = (performance.now() - startTime) / 1000.0;
    const finalEval = this.ev.evaluate(this.bestPosition);

    return {
      bestPosition: [...this.bestPosition],
      bestCost: this.bestCost,
      bestEvaluation: finalEval,
      convergence: [...this.history],
      runtimeSeconds: elapsedSeconds,
      iterations: this.config.maxIter,
      seed: this.config.seed,
      config: { ...this.config },
    };
  }

  public getBestEvaluation(): Evaluation {
    return this.ev.evaluate(this.bestPosition);
  }

  public getBestPosition(): number[] {
    return [...this.bestPosition];
  }

  public getHistory(): number[] {
    return [...this.history];
  }

  public getCurrentIter(): number {
    return this.currentIter;
  }
}
