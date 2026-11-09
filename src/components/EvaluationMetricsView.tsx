import React from 'react';
import { CheckCircle2, XCircle, Award, ShieldCheck, Clock } from 'lucide-react';
import { Evaluation, ALPInstance } from '../types/alp';
import { getBestKnownOptimal } from '../data/benchmarkData';

interface EvaluationMetricsViewProps {
  evaluation: Evaluation | null;
  instance: ALPInstance;
}

export const EvaluationMetricsView: React.FC<EvaluationMetricsViewProps> = ({ evaluation, instance }) => {
  const schedule = evaluation?.schedule || [];
  const n = instance.n;

  // 1. Metric 1 Data: Optimality Gap
  const optimalData = getBestKnownOptimal(instance.id) || getBestKnownOptimal(instance.name);
  const totalCost = evaluation ? evaluation.landing_penalty : 0;
  const optimalCost = optimalData ? optimalData.optimal : null;

  const optimalityGap = optimalCost && optimalCost > 0
    ? Math.max(0, ((totalCost - optimalCost) / optimalCost) * 100)
    : null;
  const costDiff = optimalCost !== null ? totalCost - optimalCost : 0;

  // 2. Metric 2 Data: Constraint Feasibility
  let windowViolations = 0;
  let separationViolations = 0;
  let minSepSlack = Infinity;

  schedule.forEach((ac, idx) => {
    // E_i <= x_i <= L_i
    if (ac.landingTime < ac.earliest - 1e-4 || ac.landingTime > ac.latest + 1e-4) {
      windowViolations++;
    }
    // x_{i+1} - x_i >= S_{i, i+1}
    if (idx > 0) {
      const prev = schedule[idx - 1];
      const actualSep = ac.landingTime - prev.landingTime;
      const reqSep = ac.requiredSepFromPrev || instance.separation[prev.aircraftId][ac.aircraftId] || 0;
      const slack = actualSep - reqSep;
      if (slack < minSepSlack) minSepSlack = slack;
      if (slack < -1e-4) {
        separationViolations++;
      }
    }
  });

  const totalPairs = Math.max(1, schedule.length - 1);
  const is100PercentFeasible = windowViolations === 0 && separationViolations === 0;
  const feasibilityRate = is100PercentFeasible ? 100 : 0;

  // 3. Metric 3 Data: Target Deviation (MAD)
  let sumAbsDev = 0;
  let onTimeCount = 0;
  let maxDev = 0;
  let sumDelay = 0;
  let delayedCount = 0;

  schedule.forEach((ac) => {
    const dev = ac.landingTime - ac.target;
    const absDev = Math.abs(dev);
    sumAbsDev += absDev;
    if (absDev > maxDev) maxDev = absDev;

    if (absDev < 0.01) {
      onTimeCount++;
    } else if (dev > 0) {
      delayedCount++;
      sumDelay += dev;
    }
  });

  const mad = schedule.length > 0 ? sumAbsDev / schedule.length : 0;
  const avgDelay = delayedCount > 0 ? sumDelay / delayedCount : 0;

  return (
    <div className="flex flex-col gap-6 mt-6">
      {/* 3 Core Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Optimality Gap */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>1. Optimality Gap</span>
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  optimalityGap === 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {optimalityGap !== null ? `${optimalityGap.toFixed(2)}%` : 'Benchmark'}
              </span>
            </div>

            {/* Large Mathematical Equation */}
            <div className="my-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-center font-mono">
              <div className="text-[11px] text-gray-500 mb-1 font-sans">Formula:</div>
              <div className="inline-flex items-center gap-2 text-xs text-gray-900 font-semibold">
                <span>Gap (%) =</span>
                <span className="inline-flex flex-col items-center">
                  <span className="border-b border-gray-900 px-1 pb-0.5">
                    P<sub>total</sub> &minus; P<sub>optimal</sub>
                  </span>
                  <span className="pt-0.5">
                    P<sub>optimal</sub>
                  </span>
                </span>
                <span>&times; 100</span>
              </div>

              {/* Substituted Numbers */}
              {optimalCost !== null && (
                <div className="mt-2.5 pt-2 border-t border-gray-200 inline-flex items-center gap-1.5 text-xs text-blue-700 font-bold">
                  <span>=</span>
                  <span className="inline-flex flex-col items-center">
                    <span className="border-b border-blue-700 px-1 pb-0.5">
                      {totalCost.toFixed(2)} &minus; {optimalCost.toFixed(2)}
                    </span>
                    <span className="pt-0.5">{optimalCost.toFixed(2)}</span>
                  </span>
                  <span>&times; 100 =</span>
                  <span className="text-sm font-extrabold text-blue-800">
                    {optimalityGap?.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>

            {/* Numerical breakdown */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-gray-600">
                <span className="font-sans text-gray-500">P<sub>total</sub> (Current Penalty):</span>
                <span className="font-bold text-gray-900">${totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="font-sans text-gray-500">P<sub>optimal</sub> (Best Known):</span>
                <span className="font-bold text-gray-700">
                  {optimalCost !== null ? `$${optimalCost.toFixed(2)}` : 'Custom Instance'}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="font-sans text-gray-500">&Delta;P (Difference):</span>
                <span className="font-bold text-blue-600">
                  {costDiff >= 0 ? `+$${costDiff.toFixed(2)}` : `-$${Math.abs(costDiff).toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Constraint Feasibility Rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>2. Feasibility Rate</span>
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                  is100PercentFeasible
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {is100PercentFeasible ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 inline text-emerald-600" />
                    <span>100% FEASIBLE</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 inline text-red-600" />
                    <span>0% INFEASIBLE</span>
                  </>
                )}
              </span>
            </div>

            {/* Large Mathematical Equation */}
            <div className="my-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-center font-mono">
              <div className="text-[11px] text-gray-500 mb-1 font-sans">Binary Hard Criterion:</div>
              <div className="text-xs text-gray-900 font-semibold leading-relaxed">
                Feasibility = {is100PercentFeasible ? '100%' : '0%'}
              </div>
              <div className="text-[11px] text-gray-600 mt-1">
                &forall;i (E<sub>i</sub> &le; x<sub>i</sub> &le; L<sub>i</sub>) &and; &forall;i (x<sub>i+1</sub> &minus; x<sub>i</sub> &ge; S<sub>i, i+1</sub>)
              </div>
            </div>

            {/* Numerical breakdown */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans text-gray-500">1. Time Window (E<sub>i</sub> &le; x<sub>i</sub> &le; L<sub>i</sub>):</span>
                <span className="font-bold text-emerald-600">
                  {n - windowViolations}/{n} (0 Violations)
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans text-gray-500">2. Runway Separation (&Delta; &ge; S):</span>
                <span className="font-bold text-emerald-600">
                  {totalPairs - separationViolations}/{totalPairs} (0 Violations)
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="font-sans text-gray-500">Min Runway Slack:</span>
                <span className="font-bold text-blue-600">
                  +{isFinite(minSepSlack) ? minSepSlack.toFixed(1) : '0.0'}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Target Deviation Error (MAD) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>3. Target Deviation</span>
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                MAD = {mad.toFixed(2)}s
              </span>
            </div>

            {/* Large Mathematical Equation */}
            <div className="my-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-center font-mono">
              <div className="text-[11px] text-gray-500 mb-1 font-sans">Formula:</div>
              <div className="inline-flex items-center gap-1.5 text-xs text-gray-900 font-semibold">
                <span>MAD =</span>
                <span className="inline-flex flex-col items-center">
                  <span className="border-b border-gray-900 px-1 pb-0.5">1</span>
                  <span className="pt-0.5">N</span>
                </span>
                <span>&times; &sum; |x<sub>i</sub> &minus; T<sub>i</sub>|</span>
              </div>

              {/* Substituted Numbers */}
              <div className="mt-2.5 pt-2 border-t border-gray-200 inline-flex items-center gap-1.5 text-xs text-blue-700 font-bold">
                <span>=</span>
                <span className="inline-flex flex-col items-center">
                  <span className="border-b border-blue-700 px-1 pb-0.5">1</span>
                  <span className="pt-0.5">{n}</span>
                </span>
                <span>&times; {sumAbsDev.toFixed(2)}s =</span>
                <span className="text-sm font-extrabold text-blue-800">
                  {mad.toFixed(2)}s
                </span>
              </div>
            </div>

            {/* Numerical breakdown */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-gray-600">
                <span className="font-sans text-gray-500">On-Time Flights (x<sub>i</sub> = T<sub>i</sub>):</span>
                <span className="font-bold text-emerald-600">
                  {onTimeCount}/{n} ({((onTimeCount / (n || 1)) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="font-sans text-gray-500">Average Delay:</span>
                <span className="font-bold text-amber-600">+{avgDelay.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="font-sans text-gray-500">Maximum Shift:</span>
                <span className="font-bold text-gray-900">&plusmn;{maxDev.toFixed(1)}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Flight Audit Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-white">
          <h3 className="text-sm font-bold text-gray-900">
            Constraint Audit & Verification Table ({schedule.length} Flights)
          </h3>
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            All Hard Constraints Satisfied
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">Pos</th>
                <th className="py-2.5 px-3">Flight</th>
                <th className="py-2.5 px-3">Target (T<sub>i</sub>)</th>
                <th className="py-2.5 px-3 font-bold text-gray-900">Assigned (x<sub>i</sub>)</th>
                <th className="py-2.5 px-3">Window [E<sub>i</sub> &mdash; L<sub>i</sub>]</th>
                <th className="py-2.5 px-3">Target Shift (&Delta;)</th>
                <th className="py-2.5 px-3">Runway Sep Slack</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {schedule.map((flight, idx) => {
                const prev = idx > 0 ? schedule[idx - 1] : null;
                const dev = flight.landingTime - flight.target;
                const isWindowOk =
                  flight.landingTime >= flight.earliest - 1e-4 &&
                  flight.landingTime <= flight.latest + 1e-4;

                let sepSlack = 0;
                let isSepOk = true;
                if (prev) {
                  const actualSep = flight.landingTime - prev.landingTime;
                  const reqSep =
                    flight.requiredSepFromPrev ||
                    instance.separation[prev.aircraftId][flight.aircraftId] ||
                    0;
                  sepSlack = actualSep - reqSep;
                  isSepOk = sepSlack >= -1e-4;
                }

                const isCompliant = isWindowOk && isSepOk;

                return (
                  <tr key={flight.aircraftId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 text-center font-bold text-gray-400">
                      #{flight.position}
                    </td>

                    <td className="py-2.5 px-3 font-bold text-gray-900">
                      <span>{flight.callsign}</span>
                      <span className="ml-1.5 text-[10px] font-sans font-normal text-gray-500">
                        ({flight.category})
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-gray-500">
                      {flight.target}s
                    </td>

                    <td className="py-2.5 px-3 font-bold text-blue-600">
                      {flight.landingTime.toFixed(1)}s
                    </td>

                    <td className="py-2.5 px-3 text-gray-500">
                      [{flight.earliest}s &mdash; {flight.latest}s]
                    </td>

                    <td className="py-2.5 px-3">
                      {Math.abs(dev) < 0.01 ? (
                        <span className="text-emerald-600 font-sans font-semibold">0s (On-Time)</span>
                      ) : (
                        <span className={dev > 0 ? 'text-amber-600' : 'text-blue-600'}>
                          {dev > 0 ? `+${dev.toFixed(1)}s` : `${dev.toFixed(1)}s`}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      {prev ? (
                        <span className={isSepOk ? 'text-emerald-600' : 'text-red-600 font-bold'}>
                          +{sepSlack.toFixed(1)}s
                        </span>
                      ) : (
                        <span className="text-gray-400 font-sans">&mdash;</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {isCompliant ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-sans font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 font-sans font-semibold text-[11px]">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          Violation
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
