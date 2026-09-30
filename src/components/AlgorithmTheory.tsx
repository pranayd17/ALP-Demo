import React, { useState } from 'react';
import { BookOpen, Cpu, Sliders, CheckCircle } from 'lucide-react';

export const AlgorithmTheory: React.FC = () => {
  const [betaValue, setBetaValue] = useState<number>(1.0);

  // Generate curve for adaptive coefficient a = (t / Tmax)^beta vs linear 2(1 - t / T)
  const steps = 40;
  const paperPoints: number[] = [];
  const linearPoints: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const tNorm = i / steps;
    paperPoints.push(Math.pow(tNorm, betaValue));
    linearPoints.push(2.0 * (1.0 - tNorm));
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            AGWOA Mathematical Architecture (IEEE TITS 2025)
          </h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Based on <em>"A Hybrid Heuristic Algorithm for Optimizing the Optimal Landing Time Window Problem in Intelligent Air Transportation Systems"</em> (Y. Lu, S. Chen, X. Pan, IEEE Transactions on Intelligent Transportation Systems, Oct 2025). AGWOA merges the global exploration of the Whale Optimization Algorithm (WOA), the food-source exploitation of Artificial Bee Colony (ABC), the diversity operators of Genetic Algorithms (GA), with an improved nonlinear adaptive coefficient and a Fast Convergence Update Mechanism (FCUM).
        </p>
      </div>

      {/* Grid: 4 Core Algorithmic Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pillar 1: ALP Optimization Objective */}
        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-cyan-400">01. ALP COST OBJECTIVE</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Eq. (27)-(29)</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-200 mb-2">
            P_total = ∑ [ P_bi · max(0, T_i - x_i) + P_Ai · max(0, x_i - T_i) ] + S_pen
          </div>
          <p className="text-xs text-slate-400 leading-normal">
            Minimizes total early arrival penalty (P_bi / g_i) and late arrival penalty (P_Ai / h_i) while strictly enforcing minimum wake-vortex separation intervals S_ij between sequentially landing aircraft on runway thresholds.
          </p>
        </div>

        {/* Pillar 2: ABC Probability Reference Selection */}
        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-cyan-400">02. ABC PROBABILITY WEIGHTING</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Eq. (20)-(22)</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-200 mb-2">
            P_total(X_i) = [ f(X_i) / ∑ f(X_j) ] · [ f(X_i) / max f(X_j) ]
          </div>
          <p className="text-xs text-slate-400 leading-normal">
            Unlike classical WOA which samples random search agents, AGWOA computes food-source attraction probability by compounding relative population fitness (P_follow) with peak fitness ratio (P_choose) to bias reference points toward elite clusters.
          </p>
        </div>

        {/* Pillar 3: Adaptive Coefficient & Interactive Curve */}
        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-cyan-400">03. ADAPTIVE COEFFICIENT a(t)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Eq. (14)</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-200 mb-2">
            a(t) = ( t / T_max )^β
          </div>

          {/* Interactive Beta Slider & Mini Plot */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>Exponent β: <strong className="text-cyan-400">{betaValue.toFixed(1)}</strong></span>
              <span className="text-[10px]">T=0..300 iters</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={3.0}
              step={0.1}
              value={betaValue}
              onChange={(e) => setBetaValue(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400 mb-2"
            />

            {/* SVG Mini Chart */}
            <div className="h-20 w-full bg-slate-950 rounded border border-slate-800/60 p-1 relative">
              <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                {/* Linear WOA reference (dashed) */}
                <path
                  d={`M 0,0 ${linearPoints.map((val, idx) => `L ${(idx / steps) * 200},${60 - (val / 2.0) * 55}`).join(' ')}`}
                  fill="none"
                  stroke="#475569"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                {/* Paper Eq. 14 curve */}
                <path
                  d={`M 0,60 ${paperPoints.map((val, idx) => `L ${(idx / steps) * 200},${60 - val * 55}`).join(' ')}`}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
              <span className="text-cyan-400">Cyan: Eq. 14 a(t)</span>
              <span className="text-slate-500">Gray: Linear 2(1-t/T)</span>
            </div>
          </div>
        </div>

        {/* Pillar 4: Fast Convergence Update Mechanism (FCUM) */}
        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-cyan-400">04. FCUM GRADIENT CONTRACTION</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Eq. (15)-(18)</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-200 mb-2">
            | X*_i(t+1) - X_i(t) | ≤ η · | X*_i(t) - X_i(t-1) |
          </div>
          <p className="text-xs text-slate-400 leading-normal">
            When GA crossover generates offspring, FCUM projects candidate vectors along the line-search direction (X_best - X_child) with geometric step attenuation η = 1.0, 0.5, 0.25... accepting only strict cost improvements to prevent wandering into infeasible territory.
          </p>
        </div>
      </div>

      {/* Constraints Validation Matrix */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
        <h3 className="text-xs font-mono font-bold text-white mb-2 flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Aircraft Landing Problem (ALP) Mathematical Constraints Checklist</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400 block mb-1">Time Window Bounds</span>
            <code className="text-cyan-400">E_i ≤ x_i ≤ L_i, ∀i ∈ I</code>
            <p className="text-[11px] text-slate-500 mt-1">Flights cannot touch down before airport gate opening or after fuel threshold.</p>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400 block mb-1">Wake Separation</span>
            <code className="text-cyan-400">x_q - x_p ≥ S_pq, (p ≺ q)</code>
            <p className="text-[11px] text-slate-500 mt-1">Minimum spacing along arrival corridor based on Heavy/Medium/Light vortex strength.</p>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400 block mb-1">Landing Sequence</span>
            <code className="text-cyan-400">order = argsort(x, stable)</code>
            <p className="text-[11px] text-slate-500 mt-1">Landing order is determined dynamically from landing times, not fixed flight indices.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
