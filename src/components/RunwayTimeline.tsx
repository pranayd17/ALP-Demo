import React from 'react';
import { ScheduledAircraft } from '../types/alp';
import { Clock, Plane } from 'lucide-react';

interface RunwayTimelineProps {
  schedule: ScheduledAircraft[];
}

export const RunwayTimeline: React.FC<RunwayTimelineProps> = ({ schedule }) => {
  if (schedule.length === 0) return null;

  // Determine timeline bounds
  const minTime = Math.min(...schedule.map((s) => s.earliest), 0);
  const maxTime = Math.max(
    ...schedule.map((s) => s.landingTime),
    ...schedule.map((s) => s.latest),
    100
  );
  const timeSpan = Math.max(1, maxTime - minTime);

  const getPositionPercent = (time: number): number => {
    return Math.max(0, Math.min(100, ((time - minTime) / timeSpan) * 100));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
      {/* Title & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-gray-900">
            Runway Landing Sequence Timeline
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> On-Time
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Early
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Delayed
          </span>
        </div>
      </div>

      {/* Axis Scale Ticks */}
      <div className="relative w-full h-6 border-b border-gray-200 mb-4">
        {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
          const t = minTime + frac * timeSpan;
          return (
            <div
              key={frac}
              className="absolute top-0 flex flex-col items-center -translate-x-1/2"
              style={{ left: `${frac * 100}%` }}
            >
              <div className="w-px h-2 bg-gray-300" />
              <span className="text-[11px] text-gray-400 mt-1">{t.toFixed(0)}s</span>
            </div>
          );
        })}
      </div>

      {/* Flight Timeline Rows */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
        {schedule.map((ac) => {
          const earliestPct = getPositionPercent(ac.earliest);
          const latestPct = getPositionPercent(ac.latest);
          const targetPct = getPositionPercent(ac.target);
          const landingPct = getPositionPercent(ac.landingTime);

          const isEarly = ac.deviationType === 'Early';
          const isLate = ac.deviationType === 'Late';

          return (
            <div
              key={ac.aircraftId}
              className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors text-xs"
            >
              {/* Flight Badge */}
              <div className="w-28 shrink-0 font-medium text-gray-900">
                #{ac.position} <span className="text-blue-600 font-semibold">{ac.callsign}</span>
              </div>

              {/* Horizontal Runway Track */}
              <div className="relative flex-1 h-6 flex items-center">
                {/* Allowable Window Bar */}
                <div
                  className="absolute h-2 rounded-full bg-gray-100 border border-gray-200"
                  style={{
                    left: `${earliestPct}%`,
                    width: `${Math.max(1, latestPct - earliestPct)}%`,
                  }}
                  title={`Allowed window: ${ac.earliest}s to ${ac.latest}s`}
                />

                {/* Target Marker */}
                <div
                  className="absolute w-2 h-2 rotate-45 border-2 border-gray-400 bg-white -translate-x-1/2"
                  style={{ left: `${targetPct}%` }}
                  title={`Target time: ${ac.target}s`}
                />

                {/* Scheduled Landing Marker */}
                <div
                  className={`absolute w-4 h-4 rounded-full flex items-center justify-center -translate-x-1/2 shadow-xs text-white ${
                    isEarly ? 'bg-blue-500' : isLate ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ left: `${landingPct}%` }}
                  title={`Scheduled landing: ${ac.landingTime.toFixed(1)}s`}
                >
                  <Plane className="w-2.5 h-2.5 -rotate-45 fill-current" />
                </div>
              </div>

              {/* Time and Status Label */}
              <div className="w-24 text-right text-xs">
                <span className="font-semibold text-gray-800">{ac.landingTime.toFixed(1)}s</span>
                <span
                  className={`block text-[11px] ${
                    isEarly ? 'text-blue-600' : isLate ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {ac.deviation === 0 ? 'On-time' : `${isEarly ? '-' : '+'}${ac.deviation.toFixed(1)}s`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
