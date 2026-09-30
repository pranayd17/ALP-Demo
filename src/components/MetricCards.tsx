import React from 'react';
import { Evaluation } from '../types/alp';
import { CheckCircle, AlertTriangle, Clock, DollarSign, Plane } from 'lucide-react';

interface MetricCardsProps {
  evaluation: Evaluation | null;
  aircraftCount: number;
  runtimeSeconds: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  evaluation,
  aircraftCount,
  runtimeSeconds,
}) => {
  const totalCost = evaluation?.total_cost ?? 0;
  const delay = evaluation?.delay ?? 0;
  const isFeasible = evaluation ? evaluation.feasible : true;

  const formatCost = (val: number): string => {
    if (val > 1e6) {
      return val.toExponential(2);
    }
    return val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Cost */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between text-gray-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Total Penalty Cost</span>
          <DollarSign className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {evaluation ? `$${formatCost(totalCost)}` : '--'}
        </div>
        <p className="text-xs text-gray-500 mt-1">Early/late landing penalty</p>
      </div>

      {/* 2. Total Delay */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between text-gray-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Total Delay</span>
          <Clock className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {evaluation ? `${delay.toFixed(1)}s` : '--'}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {evaluation && aircraftCount > 0 ? `Avg ${(delay / aircraftCount).toFixed(1)}s per flight` : 'Arrival delay'}
        </p>
      </div>

      {/* 3. Safety Status */}
      <div className={`p-4 rounded-xl border shadow-sm ${
        isFeasible ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
      }`}>
        <div className="flex items-center justify-between text-gray-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Runway Safety</span>
          {isFeasible ? (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          )}
        </div>
        <div className={`text-lg font-bold flex items-center gap-1.5 ${
          isFeasible ? 'text-emerald-700' : 'text-rose-700'
        }`}>
          {isFeasible ? 'Feasible (Safe)' : 'Separation Violated'}
        </div>
        <p className={`text-xs mt-1 ${isFeasible ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isFeasible ? 'All wake distances respected' : 'Safety gap too small'}
        </p>
      </div>

      {/* 4. Fleet and Runtime */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between text-gray-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Scheduled Flights</span>
          <Plane className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {aircraftCount} Flights
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {runtimeSeconds > 0 ? `Computed in ${runtimeSeconds.toFixed(2)}s` : 'Runway 09 (Single)'}
        </p>
      </div>
    </div>
  );
};
